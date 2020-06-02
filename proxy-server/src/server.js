const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const dotenv = require('dotenv-safe');
const fetch = require('node-fetch');

const conf = require('./config');
const { printTime } = require('./lib/helpers');

const PraasAPI = require('./lib/praas');

// Create global app object
const app = express();

app.use(bodyParser.json());
app.use(cors());

// store conduits indexed by curi in app.locals for lookup later...
// Start with empty cache
app.locals.cmap = new Map();

// we handle all requests to the proxy end point...
app.all('/*', (req, res) => {
  const reqCuri = req.hostname;
  const conduit = app.locals.cmap.get(reqCuri);

  // If conduit not found in Cache, send 404
  if (!conduit) {
    return res.status(404).send(`${reqCuri} conduit not found`);
  }

  // check racm for allowed methods
  if (conduit.racm.findIndex(method => method === req.method) === -1) {
    return res.status(405).send(`${req.method} is not permitted`);
  }

  // perform hidden form field validation
  for (let i = 0, imax = conduit.hiddenFormField.length; i < imax; i++) {
    const hff = conduit.hiddenFormField[i];
    let reqHff = undefined;
    if (req.body && req.body[hff.fieldName]) reqHff = req.body[hff.fieldName];

    // This feature is to catch spam bots, so don't
    // send error if failure, send 200-OK instead
    if (hff && hff.policy === 'drop-if-filled' && reqHff) {
      return res.sendStatus(200);
    }

    if (hff && hff.policy === 'pass-if-match' && !(reqHff === hff.value)) {
      return res.sendStatus(200);
    }
  }

  // Prepare request
  const url = conduit.suri + '/' + conduit.suriObjectKey + req.path;
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${conduit.suriApiKey}`,
    },
  };

  if (!(req.method === 'GET') && req.body.records) {
    options.body = JSON.stringify(req.body);
  }

  // Send request
  let respStat;
  if (conduit.suriType === 'Airtable') {
    fetch(url, options)
      .then(resp => {
        respStat = resp.status;
        return resp.json();
      })
      .then(json => res.status(respStat).send(json))
      .catch(err => res.status(500).send(err));
  }
});

/// error handling...
// note: error handler should be registered after all routes have been registered
if (conf.production) {
  app.use(function (err, req, res, next) {
    // no stacktraces leaked to user in production mode
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
  });
} else {
  // in development mode, use error handler and print stacktrace
  app.use(errorhandler());
  app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

// Returns proxy server user object (with credentials filled in from .env file)
// TODO: move this to a common library accessible to both proxy and crud servers
function getProxyServerCredentials() {
  let proxy_credentials = undefined;
  try {
    // add proxy-server user... this is temporary and will go away when we
    // integrate with OAuth2 and support client credentials grant flow...
    proxy_credentials = dotenv.config({
      allowEmptyValues: true,
      example: path.resolve('../.env-example'),
      path: path.resolve('../.env'),
    });
    // console.log(proxy_credentials);
  } catch (e) {
    console.log('unexpected...', e);
    process.exit(1);
  }

  return {
    user: {
      firstName: 'Proxy',
      lastName: 'Server',
      email: proxy_credentials.parsed.PROXY_SERVER_EMAIL,
      password: proxy_credentials.parsed.PROXY_SERVER_PASSWORD,
    },
  };
}

async function fetchConduits(user) {
  // fetch a list of conduits... be sure to run test-model, test-rest in sequence
  // before starting the proxy so we have data to test...
  try {
    const payload = await PraasAPI.conduit.list(user.id);
    const conduits = payload.conduits;

    // remove conduits which are not found in the list, from the cache
    app.locals.cmap.forEach(cache => {
      if (conduits.findIndex(list => list.curi === cache.curi) === -1) {
        app.locals.cmap.delete(cache.curi);
      }
    });

    // upsert conduits in cache from list received
    for (let i = 0, imax = conduits.length; i < imax; i++) {
      const conduit = conduits[i];
      app.locals.cmap.set(conduit.curi, conduit);
    }

    console.log(`${printTime()} : ${app.locals.cmap.size} active conduits`);
  } catch (e) {
    console.log('unexpected... ', e);
  }
};

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  // fetch the conduits first... but first check if our credentials are kosher with resource server
  // by logging in...
  PraasAPI.user
    .login(getProxyServerCredentials())
    .then(async (data) => {
      // console.log('logged in?', data);
      // save our token...

      global.localStorage.setItem('user', JSON.stringify({ ...data.user }));

      fetchConduits(data.user);
      setInterval(() => fetchConduits(data.user), conf.cacheRefreshInterval);
    })
    .catch((error) => { console.log('unexpected... ', error); process.exit(1); });

  // start listening only after logging in to the resource server...
  // if we can't login then there's no point in running the proxy
  app.listen(conf.port, () => {
    console.log(`Conduits proxy server is listening on port ${conf.port}`);
  });
}
