const router = require('express').Router();
const Conduit = require('../../models').Conduit;
const auth = require('../auth');
const helpers = require('../../lib/helpers');

// add conduit
router.post('/', auth.required, async function (req, res, next) {
  const conduit = new Conduit();
  const errors = {};

  conduit.userId = req.payload.id;
  conduit.curi = 'td'; // for now the prefix is hardcoded, to be updated
  conduit.throttle = true;
  conduit.status = 'Inactive';

  const conduitReqdFields = ['suriApiKey', 'suriType', 'suri', 'whitelist', 'racm'];
  const conduitOptFields = ['suriObjectKey', 'throttle', 'status', 'description', 'hiddenFormField'];
  helpers.processInput(req.body.conduit, conduitReqdFields, conduitOptFields, conduit, errors);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  try { await conduit.save(); } catch (error) {
    return res.status(500).json({ error });
  };

  return res.status(201).json({ conduit: { id: conduit.id } });
});

// Get conduit
router.get('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({ where: { id: req.params.id, userId: req.payload.id } });
    if (!conduit) { return res.sendStatus(404); }

    return res.json({ conduit: conduit.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Get all conduits
router.get('/', auth.required, async (req, res, next) => {
  try {
    const conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
    if (!conduits) { return res.sendStatus(404); }
    return res.json({ conduits: conduits.map(i => i.toJSON()) });
  } catch (error) {
    next(error);
  }
});

// Update conduit
router.patch('/:id', auth.required, async (req, res, next) => {
  let errors = null;
  try {
    const conduit = await Conduit.findByPk(req.params.id);
    if (!conduit) {
      return res.sendStatus(404);
    }
    await conduit.update(req.body.conduit);
    res.status(200).json({ conduit: conduit.toJSON() });
  } catch (e) {
    errors = e;
    console.log('errors... ', e);
  }
  next(errors);
});

// Delete conduit
router.delete('/:id', auth.required, async (req, res, next) => {
  try {
    const count = await Conduit.destroy({ where: { id: req.params.id, userId: req.payload.id } });
    return count ? res.sendStatus(200) : res.sendStatus(404);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
