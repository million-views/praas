const router = require('express').Router();
const Conduit = require('../../models').Conduit;
const auth = require('../auth');
const passport = require('passport');

// Get all conduits
router.get('/conduits', auth.required, async (req, res, next) => {
  try {
    const conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
    if (!conduits) { return res.sendStatus(401); }

    return res.json({ conduit: conduits.map(i => i.toProfileJSONFor()) });
  } catch (error) {
    next(error);
  }
});

// add conduit
router.post('/conduits', function (req, res, next) {
  const conduit = new Conduit();
  const errors = {};

  if (typeof req.body.conduit.suriApiKey !== 'undefined') {
    conduit.suriApiKey = req.body.conduit.suriApiKey;
  } else {
    errors.suriApiKey = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.suriType !== 'undefined') {
    conduit.suriType = req.body.conduit.suriType;
  } else {
    errors.suriType = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.suri !== 'undefined') {
    conduit.suri = req.body.conduit.suri;
  } else {
    errors.suri = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.whitelist !== 'undefined') {
    conduit.whitelist = req.body.conduit.whitelist;
  } else {
    errors.whitelist = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.racm !== 'undefined') {
    conduit.racm = req.body.conduit.racm;
  } else {
    errors.racm = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.throttle !== 'undefined') {
    conduit.throttle = req.body.conduit.throttle;
  } else {
    errors.throttle = ['can\'t be blank'];
  }

  if (typeof req.body.conduit.email !== 'undefined') {
    conduit.email = req.body.conduit.email.toLowerCase();
  } else {
    errors.email = ['email can\'t be blank'];
  }

  if (Object.keys(errors).length === 0) {
    conduit.save().then(function () {
      return res.json({ conduit: conduit.toAuthJSON() });
    }).catch(next);
  } else {
    return res.status(422).json({ errors });
  }
});

// Update User
router.put('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    if (typeof req.body.user.firstName !== 'undefined') {
      user.firstName = req.body.user.firstName;
    }

    if (typeof req.body.user.lastName !== 'undefined') {
      user.lastName = req.body.user.lastName;
    }

    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password);
    }

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
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

module.exports = router;
