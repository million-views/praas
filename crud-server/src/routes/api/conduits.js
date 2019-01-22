const router = require('express').Router();
const Conduit = require('../../models').Conduit;
const auth = require('../auth');
const helpers = require('../../lib/helpers');

// add conduit
router.post('/conduits/', auth.required, async function (req, res, next) {
  const conduit = new Conduit();
  const errors = {};

  conduit.userId = req.payload.id;
  conduit.curi = 'td'; // for now the prefix is hardcoded, to be updated
  conduit.throttle = true;
  conduit.status = 'Inactive';

  const conduitReqdFields = ['suriApiKey', 'suriType', 'suri', 'whitelist', 'racm', 'throttle', 'status'];
  const conduitOptFields = ['suriObjectKey', 'throttle', 'status', 'description', 'hiddenFormField'];
  helpers.processInput(req.body.conduit, conduitReqdFields, conduitOptFields, conduit, errors);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  try { await conduit.save(); } catch (error) {
    return res.status(500).json({ error });
  };

  return res.status(201).json({ conduit: { id: conduit.id } });
});

// Get conduit
router.get('/conduits/:conduitId', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({ where: { id: req.params.conduitId, userId: req.payload.id } });
    if (!conduit) { return res.sendStatus(404); }

    return res.json({ conduit: conduit.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Get all conduits
router.get('/conduits', auth.required, async (req, res, next) => {
  try {
    const conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
    if (!conduits) { return res.sendStatus(404); }
    return res.json({ conduit: conduits.map(i => i.toJSON()) });
  } catch (error) {
    next(error);
  }
});

// Update conduit
router.patch('/conduits/:conduitId', auth.required, async (req, res, next) => {
  const errors = {};
  if (typeof req.body.update === 'undefined') {
    errors.update = "can't be blank";
  }

  try {
    if (Object.keys(errors).length) {
      return res.status(422).json({ errors });
    }
    const query = { where: { id: req.params.conduitId, userId: req.payload.id } };
    const count = await Conduit.update(req.body.update, query);
    return count ? res.sendStatus(200) : res.sendStatus(404);
  } catch (error) {
    next(error);
  }
});

// Delete conduit
router.delete('/conduits/:conduitId', auth.required, async (req, res, next) => {
  try {
    const count = await Conduit.destroy({ where: { id: req.params.conduitId, userId: req.payload.id } });
    return count ? res.sendStatus(200) : res.sendStatus(404);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
