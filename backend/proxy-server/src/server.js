const express = require('express');
const gateway = require('./gateway');

const { RestApiErrorHandler } = require('../../lib/error');
const helpers = require('../../lib/helpers');
const PraasAPI = require('../../lib/praas');
const tokenService = require('./token-service');
const conf = require('../../config').system.settings;

// store conduits indexed by curi in app.locals for lookup later...
// Start with empty cache - this will be populated by fetchConduits
const cmap = new Map();

const app = express();
app.use(gateway.head());
app.use(gateway.middle({ cmap }));
app.use(gateway.tail({ debug: true }));
app.use(RestApiErrorHandler); // !! should be registered last

console.log(
  `Gateway server is in ${
    conf.production ? 'production' : 'development'
  } mode...`
);

const { user: credentials } = helpers.getProxyServerCredentials();

async function loginToResourceServer() {
  const data = await tokenService.getAccessToken('conduits', credentials);
  // save our token...
  if (!data.cached) {
    // this a fresh access token that is needed by API
    console.log('access-token refreshed!');
    globalThis.localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data.user;
}

// const loginOnce = once(loginToResourceServer);

async function fetchConduits() {
  // before starting the proxy so we have data to test...
  const user = await loginToResourceServer();

  try {
    const { data: payload } = await PraasAPI.conduit.list(user.id);
    const conduits = payload.conduits;

    // remove conduits which are not found in the list, from the cache
    cmap.forEach((cache) => {
      if (conduits.findIndex((list) => list.curi === cache.curi) === -1) {
        cmap.delete(cache.curi);
      }
    });

    // upsert conduits in cache from list received
    for (let i = 0, imax = conduits.length; i < imax; i++) {
      const conduit = conduits[i];
      cmap.set(conduit.curi, conduit);
    }

    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    console.log(`${timestamp} : ${cmap.size} active conduits`);
  } catch (e) {
    console.log('unexpected... ', e);
  }
}

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  // by logging in...
  (async () => {
    try {
      fetchConduits();
      setInterval(() => fetchConduits(), conf.cacheRefreshInterval);
    } catch (error) {
      console.log('unexpected...', error);
      process.exit(1);
    }
  })();

  // start listening only after logging in to the resource server...
  // if we can't login then there's no point in running the proxy
  app.listen(conf.gwServerPort, 'localhost', () =>
    console.log(
      `Conduits proxy server is listening on port ${conf.gwServerPort}`
    )
  );
}

module.exports = { app };
