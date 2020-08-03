const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const conf = require('../../config').system.settings;
const models = require('./models');
const { RestApiErrorHandler } = require('../../lib/error');
const helpers = require('../../lib/helpers');

require('./passport');

// Create global app object
const app = express();

// Log all requests to console
// const morgan = require('morgan');
// app.use(morgan('dev'));
// app.use(morgan('combined'));

app.use(cors());

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

console.log(
  `Conduits resource server is in ${conf.production ? 'production' : 'development'} mode...`
);

// error handling...
// note: error handler should be registered after all routes have been registered
app.use(RestApiErrorHandler);

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  models.db.sync({ force: false }).then(
    async () => {
      const proxyUser = helpers.getProxyServerCredentials().user;
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
          process.exit(3);
        }
      }

      // set this user as a privileged client (i.e our proxy server) in app local
      // so we can check for privileged access in the routes...
      app.locals.proxyUser = user;
      console.log(
        'app.locals.proxyUser -> email: ',
        app.locals.proxyUser.email, ' id: ',
        app.locals.proxyUser.id
      );

      // start listening iff all good... we get here only if the database exists
      // and proxy user is either created anew or already exists.
      app.listen(conf.apiServerPort, async () => {
        console.log(`Conduits API server is listening on port ${conf.apiServerPort}`);
      });
    }
  );
}

module.exports = { app, port: conf.apiServerPort }; // for testing
