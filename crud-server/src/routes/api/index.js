const router = require('express').Router();
const RestApiError = require('../../lib/error');

// v.a:
// we mount users at root since it supports /user
// and /users endpoints. TODO: check what is the
// best practice here. If it were not for the variation
// we might as well fix it here.
router.use('/', require('./users'));

// v.a:
// the implementation should not care about where the
// it is being rooted to since that can change. For
// example, in the future I might rename 'conduits'
// to 'pipes'... mounting the functionality here
// implies I could make a single change in the next
// line and everything else should work as before.
router.use('/conduits', require('./conduits'));

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).reduce(function (errors, key) {
      errors[key] = err.errors[key].message;
      return errors;
    }, {});
    return next(new RestApiError(req.path, 422, errors));
  }

  if (err.name === 'UnauthorizedError') return res.status(401).json(err);
  if (err.name === 'UnauthorizedError') return next(new RestApiError(req.path, 401, err));

  return next(err);
});

module.exports = router;
