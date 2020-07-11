const router = require('express').Router();
const User = require('../../models').User;
const auth = require('../auth');
const helpers = require('../../lib/helpers');
const passport = require('passport');

REST_API_ERRORS = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  422: 'Unprocessable Entity',
  424: 'Failed Dependency',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required',
};

function RestApiError(path, statusCode, errors = [], message = undefined) {
  Error.captureStackTrace(this, this.constructor);
  this.path = path;
  this.errors = errors;
  this.message = message || REST_API_ERRORS[statusCode];
  this.status = statusCode;
  console.log('Inside RestApiError function, statusCode', statusCode);
};

router.get('/user', auth.required, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.payload.id } });
    if (!user) return res.sendStatus(401);
    return res.json({ user: user.toAuthJSON() });
  } catch (error) {
    next(error);
  }
});

// Registration
router.post('/users', async (req, res, next) => {
  const user = new User();
  const errors = {};

  const userReqFields = ['firstName', 'email', 'password'];
  const userOptFields = ['lastName'];
  helpers.processInput(req.body.user, userReqFields, userOptFields, user, errors);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  try {
    const result = await user.save();
    return res.json({ user: result.toAuthJSON() });
  } catch ({ name, errors: dberrors, fields }) {
    // console.log(name, errors, fields);
    if (name === 'SequelizeUniqueConstraintError') {
      for (let i = 0; i < fields.length; i++) {
        errors[fields[i]] = dberrors[i].message;
      }
      return res.status(422).json({ errors });
    } else {
      errors.unknown = `unknown error ${name}, please contact support`;
      next(errors);
    }
  }
});

// Update User
router.put('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) return res.sendStatus(401);

    const userOptFields = ['firstName', 'lastName', 'password'];
    helpers.processInput(req.body.user, [], userOptFields, user, {});

    return user.save().then(function () {
      return res.json({ user: user.toAuthJSON() });
    });
  }).catch((reason) => {
    console.log('error: ', reason);
    next(reason);
  });
});

// Authentication
router.post('/users/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) {
      console.log('err: ', err);
      return next(err);
    }

    if (user) {
      const userWithJwt = user.toAuthJSON();
      // console.log('user.with.jwt; ', userWithJwt);
      return res.json({ user: userWithJwt });
    } else {
      // return res.status(422).json(info);
      return next(new RestApiError(req.path, 422, errors, message));
    }
  })(req, res, next);
});

module.exports = router;
