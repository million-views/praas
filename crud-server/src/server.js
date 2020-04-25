const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const errorhandler = require('errorhandler');
const conf = require('./config');
const models = require('./models');
require('./passport');

// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
// app.use(require('morgan')('dev'));
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

/// error handling...
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

// launch the server and listen only when running as a standalone process
if (!module.parent) {
  app.listen(conf.port, () => {
    console.log(`Praas API server is listening on port ${conf.port}`);
  });
}

module.exports = { app, port: conf.port, models }; // for testing
