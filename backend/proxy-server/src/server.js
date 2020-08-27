const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const { pushData } = require('./integrations/airtable');

const { RestApiError, RestApiErrorHandler } = require('../../lib/error');
const config = require('../../config');
const conf = config.system.settings;

const helpers = require('../../lib/helpers');
const PraasAPI = require('../../lib/praas');

const upload = multer();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// store conduits indexed by curi in app.locals for lookup later...
// Start with empty cache - this will be populated by fetchConduits
app.locals.cmap = new Map();

// cache frequently used objects
const SURI = {};
config.targets.settings.forEach((i) => (SURI[i.type] = i.suri));

// we handle all requests to the proxy end point...
app.all('/*', upload.none(), (req, res, next) => {
  const reqCuri = req.get('host');
  const conduit = app.locals.cmap.get(reqCuri);
  if (!conduit) {
    // If conduit not found in Cache, send 404
    // FIXME: per MDN, the statusCode should be 400
    return next(
      new RestApiError(404, {
        conduit: `${reqCuri} not found`,
      })
    );
  }

  // Top of the stack check is ip allow-list check
  // - Only IPv4 is handled in v1
  // - We implicitly allow loopback address (127.0.0.1)
  // - empty allowlist implies all origins allowed
  // - the code that follows may not be optimal.
  const clientIp = req.connection.remoteAddress;
  const allowlist = conduit.allowlist;
  if (allowlist.length > 0 && clientIp !== '127.0.0.1') {
    let allowedIP = null;
    for (let i = 0, imax = allowlist.length; i < imax; i++) {
      const item = allowlist[i];
      if (item.status === 'active' && item.ip === clientIp) {
        allowedIP = item;
        break;
      }
    }
    if (!allowedIP) {
      return next(
        new RestApiError(403, {
          client: `${clientIp} restricted`,
        })
      );
    }

    if (allowedIP.status !== 'active') {
      return next(
        new RestApiError(403, {
          client: `${clientIp} restricted`,
        })
      );
    }
  }

  // check racm for allowed methods
  if (conduit.racm.findIndex((method) => method === req.method) === -1) {
    return next(
      new RestApiError(405, {
        [req.method]: 'not permitted',
      })
    );
  }

  if (['PUT', 'PATCH', 'POST'].includes(req.method)) {
    // PUT, POST and PATCH operations have records in body
    if (!req.body.records) {
      return next(
        new RestApiError(422, {
          records: 'not present',
        })
      );
    }

    if (req.body.records[0].fields === undefined) {
      // PUT, POST and PATCH operations need fields data in body
      return next(
        new RestApiError(422, {
          fields: 'not present',
        })
      );
    }
  }

  // PUT and PATCH operations need id field in body
  if (
    ['PUT', 'PATCH'].includes(req.method) &&
    req.body.records[0].id === undefined
  ) {
    return next(
      new RestApiError(422, {
        id: 'not provided',
      })
    );
  }

  // perform hidden form field validation (needed only for new record creation)

  if (req.method === 'POST') {
    for (let i = 0, imax = conduit.hiddenFormField.length; i < imax; i++) {
      // We`ll be using this multiple times, so store in a short variable
      const hff = conduit.hiddenFormField[i];
      const reqHff = req.body.records?.[0].fields[hff.fieldName];

      // This feature is to catch spam bots, so don't
      // send error if failure, send 200-OK instead
      if (hff.policy === 'drop-if-filled' && reqHff) {
        return res.sendStatus(200);
      }

      if (hff?.policy === 'pass-if-match' && !(reqHff === hff.value)) {
        return res.sendStatus(200);
      }

      if (!hff.include) {
        delete req.body.records[0].fields[hff.fieldName];
      }
    }
  }

  // Prepare request
  let url = SURI[conduit.suriType];
  if (conduit.suriObjectKey) {
    // mdn strongly recommends + or += operator for performance
    url += `${conduit.suriObjectKey}`;
  }
  url += req.path;

  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${conduit.suriApiKey}`,
    },
  };

  // GET and DELETE don't need request body
  if (['PUT', 'POST', 'PATCH'].includes(req.method)) {
    options.body = JSON.stringify(req.body);
  }

  // Multi DELETE to be sent as query paramters
  if (req.method === 'DELETE' && req.query.records) {
    url += req.query.records.reduce((q, i) => q + `records[]=${i}&`, '?');
  }

  // Send request
  if (conduit.suriType === 'airtable') {
    pushData(url, options)
      .then((response) => {
        const { status, data } = response;
        res.status(status).send(data);
      })
      .catch((err) => next(new RestApiError(500, err)));
  }
});

console.log(
  `Gateway server is in ${
    conf.production ? 'production' : 'development'
  } mode...`
);

// error handling...
// note: error handler should be registered after all routes have been registered
app.use(RestApiErrorHandler);

async function fetchConduits(user) {
  // before starting the proxy so we have data to test...
  try {
    const payload = await PraasAPI.conduit.list(user.id);
    const conduits = payload.conduits;

    // remove conduits which are not found in the list, from the cache
    app.locals.cmap.forEach((cache) => {
      if (conduits.findIndex((list) => list.curi === cache.curi) === -1) {
        app.locals.cmap.delete(cache.curi);
      }
    });

    // upsert conduits in cache from list received
    for (let i = 0, imax = conduits.length; i < imax; i++) {
      const conduit = conduits[i];
      app.locals.cmap.set(conduit.curi, conduit);
    }

    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    console.log(`${timestamp} : ${app.locals.cmap.size} active conduits`);
  } catch (e) {
    console.log('unexpected... ', e);
  }
}

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  // by logging in...
  PraasAPI.user
    .login(helpers.getProxyServerCredentials())
    .then(async (data) => {
      // console.log('logged in?', data);
      // save our token...

      global.localStorage.setItem('user', JSON.stringify({ ...data.user }));

      fetchConduits(data.user);
      setInterval(() => fetchConduits(data.user), conf.cacheRefreshInterval);
    })
    .catch((error) => {
      console.log('unexpected... ', error);
      process.exit(1);
    });

  // start listening only after logging in to the resource server...
  // if we can't login then there's no point in running the proxy
  app.listen(conf.gwServerPort, 'localhost', () =>
    console.log(
      `Conduits proxy server is listening on port ${conf.gwServerPort}`
    )
  );
}

module.exports = { app };
