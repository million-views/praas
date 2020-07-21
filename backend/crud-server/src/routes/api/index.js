const router = require('express').Router();

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

module.exports = router;
