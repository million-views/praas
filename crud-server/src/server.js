const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
// const errorhandler = require('errorhandler');
const dotenv = require('dotenv-safe');

const conf = require('./config');
const models = require('./models');

require('./passport');

// Create global app object
const app = express();

app.use(cors());

// Log all requests to console
// const morgan = require('morgan');
// app.use(morgan('dev'));
// app.use(morgan('combined'));

// Normal express config defaults
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
  secret: 'praas',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

app.use(require('./routes'));

/// catch 404 and forward to error handler
// v.a: temp disabled since it is catching 404...
// ... which is debatable whether a REST API
// should prefer 404 over another response code
// to indicate a not found entity.
//
// see:
//  - https://stackoverflow.com/questions/9930695/rest-api-404-bad-uri-or-missing-resource
//  - https://stackoverflow.com/questions/26845631/is-it-correct-to-return-404-when-a-rest-resource-is-not-found/26845858
// ---
// app.use(function (req, res, next) {
//   console.log(req);
//   const err = new Error('Not Found: ' + JSON.stringify(req.route));
//   err.status = 404;
//   next(err);
// });

// error handling...
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
  console.log('Conduits resource server is in development mode...');
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    // res.json(err.body);
    // FIXME!
    // in the next round we need to normalize the shape of the error
    // response and fixup all the test cases.
    // res.json({
    //   errors: {
    //     message: err.message,
    //     error: err.errors
    //   }
    // });

    // FIXME!
    // hack to keep going; revisit during a proper normalization phase.
    // naive normalization follows to make the tests pass with minimal
    // changes...

    // what a mess!
    let errors = err.errors;
    if (!Array.isArray(errors)) {
      if (errors.errors) {
        errors = errors.errors;
      }
    }
    res.json({ errors });
    console.error(err);
    // next(res);
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
    console.log('Unexpected... ', e);
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
  models.db.sync({ force: false }).then(
    async () => {
      const proxyUser = getProxyServerCredentials().user;
      let user = new models.User();
      Object.assign(user, proxyUser);
      try {
        await user.save();
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          console.log('Client credentials for proxy already registered!');
          // find our privileged user... TODO: think of ways this method can fail and catch the failures....
          user = await models.User.exists(proxyUser.email, proxyUser.password);
        } else {
          console.log(`Unexpected error: ${e.name}, aborting... ${e}`);
          process.exit(2);
        }
      }

      // set this user as a privileged client (i.e our proxy server) in app local
      // so we can check for privileged access in the routes...
      app.locals.proxyUser = user;
      console.log('app.locals.proxyUser -> email: ', app.locals.proxyUser.email, ' id: ', app.locals.proxyUser.id);

      // start listening iff all good... we get here only if the database exists
      // and proxy user is either created anew or already exists.
      app.listen(conf.port, async () => {
        console.log(`Praas API server is listening on port ${conf.port}`);
      });
    }
  );
}

module.exports = { app, port: conf.port, models }; // for testing
