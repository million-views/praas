const path = require('path');
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const conf = require('./config');
const dotenv = require('dotenv-safe');

const PraasAPI = require('./lib/praas');

// Create global app object
const app = express();

app.use(cors());

// we handle all requests to the proxy end point...
// TODO: this will evolve... soonish
app.get('/', (req, res) => res.send('Hi there....PRaaS Proxy server is up and running!'));

/// error handling...
// note: error handler should be registered after all routes have been registered
if (conf.production) {
  app.use(function (err, req, res, next) {
    // no stacktraces leaked to user in production mode
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {}
      }
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
        error: err
      }
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
      password: proxy_credentials.parsed.PROXY_SERVER_PASSWORD
    }
  };
}

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  // fetch the conduits first... but first check if our credentials are kosher with resource server
  // by logging in...
  PraasAPI.user.login(getProxyServerCredentials()).then(
    async (data) => {
      // console.log('logged in?', data);
      // save our token...
      localStorage.setItem('user', JSON.stringify({ ...data.user }));

      // fetch a list of conduits... be sure to run test-model, test-rest in sequence
      // before starting the proxy so we have data to test...
      try {
        const payload = await PraasAPI.conduit.list(data.user.id);
        const conduits = payload.conduits;
        let conduit;
        // console.log('conduits... yay!', typeof(conduits), conduits);

        // store conduits indexed by curi in app.locals for lookup later...
        const cmap = new Map();
        for (let i=0, imax=conduits.length; i < imax; i++) {
          conduit = conduits[i];
          cmap.set(conduit.curi, conduit);
        }
        app.locals.cmap = cmap;
        console.log(`${app.locals.cmap.size} active conduits received`);
      } catch (e) {
        console.log('unexpected... ', e);
      }

      // start listening only after logging in to the resource server...
      // if we can't login then there's no point in running the proxy
      app.listen(conf.port, () => {
        console.log(`Conduits proxy server is listening on port ${conf.port}`);
      });
    },
    (error) => {
      console.log('unexpected... ', error);
    }
  );
}
