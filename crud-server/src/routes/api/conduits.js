const router = require('express').Router();
const Conduit = require('../../models').Conduit;
const auth = require('../auth');

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
router.post('/conduits/', function (req, res, next) {
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

  if (typeof req.body.conduit.suriObjectKey !== 'undefined') {
    conduit.suriObjectKey = req.body.conduit.suriObjectKey;
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
    conduit.throttle = true;
  }

  if (typeof req.body.conduit.status !== 'undefined') {
    conduit.status = req.body.conduit.status;
  } else {
    conduit.status = 'Inactive';
  }

  if (typeof req.body.conduit.description !== 'undefined') {
    conduit.description = req.body.conduit.description;
  }

  if (typeof req.body.conduit.hiddenFormField !== 'undefined') {
    conduit.hiddenFormField = req.body.conduit.hiddenFormField;
  }

  if (Object.keys(errors).length === 0) {
    conduit.save().then(function () {
      return res.json({ conduit: conduit.toAuthJSON() });
    }).catch(next);
  } else {
    return res.status(422).json({ errors });
  }
});

module.exports = router;
