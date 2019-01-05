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
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handling...
if (conf.production) {
  app.use(function (err, req, res, next) {
    // no stacktraces leaked to user in production mode
    res.status(err.status || 500);
    res.json({
      'errors': {
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
      'errors': {
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
