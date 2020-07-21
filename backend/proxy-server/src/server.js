const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');

const { RestApiError, RestApiErrorHandler } = require('../../lib/error');
const conf = require('../../config').system.settings;
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

// we handle all requests to the proxy end point...
app.all('/*', upload.none(), (req, res, next) => {
  // PUT, POST and PATCH operations have records in body
  if (['PUT', 'PATCH', 'POST'].includes(req.method) &&
    !(req.body.records)) {
    return next(new RestApiError(422, { records: 'not present' }));
  }

  // PUT, POST and PATCH operations need fields data in body
  if (['PUT', 'PATCH', 'POST'].includes(req.method) &&
    req.body.records[0].fields === undefined) {
    return next(new RestApiError(422, { fields: 'not present' }));
  }

  // PUT and PATCH operations need id field in body
  if (['PUT', 'PATCH'].includes(req.method) &&
    req.body.records[0].id === undefined) {
    return next(new RestApiError(422, { id: 'not provided' }));
  }

  const reqCuri = req.get('host');
  // console.log(`reqCuri: ${reqCuri}`);
  const conduit = app.locals.cmap.get(reqCuri);

  // If conduit not found in Cache, send 404
  if (!conduit) {
    return next(new RestApiError(404, { conduit: `${reqCuri} not found` }));
  }

  // check racm for allowed methods
  if (conduit.racm.findIndex(method => method === req.method) === -1) {
    return next(new RestApiError(405, { [req.method]: 'not permitted' }));
  }

  // perform hidden form field validation (needed only for new record creation)
  if (req.method === 'POST') {
    for (let i = 0, imax = conduit.hiddenFormField.length; i < imax; i++) {
      // We`ll be using this multiple times, so store in a short variable
      const hff = conduit.hiddenFormField[i];
      let reqHff = undefined;
      if (req.body.records && req.body.records[0].fields[hff.fieldName]) {
        reqHff = req.body.records[0].fields[hff.fieldName];
      };

      // This feature is to catch spam bots, so don't
      // send error if failure, send 200-OK instead
      if (hff && hff.policy === 'drop-if-filled' && reqHff) {
        return res.sendStatus(200);
      }

      if (hff && hff.policy === 'pass-if-match' && !(reqHff === hff.value)) {
        return res.sendStatus(200);
      }

      if (!hff.include) {
        delete req.body.records[0].fields[hff.fieldName];
      }
    }
  }

  // Prepare request
  let url = conduit.suri;
  if (conduit.suriObjectKey) {
    // mdn strongly recommends + or += operator for performance
    url += `/${conduit.suriObjectKey}`;
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
  if ((req.method === 'DELETE') && req.query.records) {
    url += req.query.records.reduce((q, i) => q + `records[]=${i}&`, '?');
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
      .catch(err => next(new RestApiError(500, err)));
  }
});

console.log(
  `Gateway server is in ${conf.production ? 'production' : 'development'} mode...`
);

// error handling...
// note: error handler should be registered after all routes have been registered
app.use(RestApiErrorHandler);

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

    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    console.log(`${timestamp} : ${app.locals.cmap.size} active conduits`);
  } catch (e) {
    console.log('unexpected... ', e);
  }
};

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  // fetch the conduits first... but first check if our credentials are kosher with resource server
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
    .catch((error) => { console.log('unexpected... ', error); process.exit(1); });

  // start listening only after logging in to the resource server...
  // if we can't login then there's no point in running the proxy
  app.listen(
    conf.gwServerPort,
    () => console.log(`Conduits proxy server is listening on port ${conf.gwServerPort}`)
  );
}

module.exports = { app };
