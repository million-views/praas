const router = require('express').Router();
const models = require('../../models');
const Conduit = require('../../models').Conduit;
const auth = require('../auth');
const helpers = require('../../lib/helpers');
const Op = require('sequelize').Op;

// add conduit
router.post('/', auth.required, async function (req, res, next) {
  const conduit = new Conduit();
  const errors = {};

  conduit.userId = req.payload.id;
  conduit.curi = await helpers.makeCuri(models.System.cconf.settings.prefix);
  conduit.throttle = true;
  conduit.status = 'Inactive';

  const conduitReqdFields = ['suriApiKey', 'suriType', 'suri', 'whitelist', 'racm'];
  const conduitOptFields = ['suriObjectKey', 'throttle', 'status', 'description', 'hiddenFormField'];
  helpers.processInput(await req.body.conduit, conduitReqdFields, conduitOptFields, conduit, errors);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  try { await conduit.save(); } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      conduit.curi = await helpers.makeCuri(models.System.cconf.settings.prefix);
      await conduit.save();
    } else return res.status(500).json({ error });
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

// Get all conduits + batch (start & count)
// TODO: add ACL/scope check when integrated with OAuth2
// For now we are hacking to support proxy-server functionality without adding complexity
router.get('/', auth.required, async (req, res, next) => {
  try {
    let conduits = undefined;
    if (typeof req.query.start !== 'undefined' && typeof req.query.count !== 'undefined') {
      conduits = await Conduit.findAll({
        where: { id: { [Op.gte]: req.query.start, [Op.lt]: +req.query.start+ +req.query.count }, userId: req.payload.id }
      });
    } else {
      if (req.app.locals.proxyUser && req.app.locals.proxyUser.id === req.payload.id) {
        // fetch all conduits in active status... TODO: this is brittle and can break
        conduits = await Conduit.findAll({ where: { status: 'active' } });
      } else {
        conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
      }
    }

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
    if (req.body.conduit.curi === undefined) {
      await conduit.update(await req.body.conduit);
      res.status(200).json({ conduit: conduit.toJSON() });
    } else {
      return res.sendStatus(400);
    }
  } catch (e) {
    errors = e;
    console.log('errors... ', e);
  }
  next(errors);
});

// Delete conduit
router.delete('/:id', auth.required, async (req, res, next) => {
  try {
    // const count = await Conduit.destroy({ where: { id: req.params.id, userId: req.payload.id } });
    const count = await Conduit.destroy({ where: { id: req.params.id } });
    // return count ? res.sendStatus(200) : res.sendStatus(404);
    return count ? res.status(200).json({ conduit: { id: req.params.id } }) : res.sendStatus(404);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
