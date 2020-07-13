const router = require('express').Router();
const { Op } = require('sequelize');

const auth = require('../auth');
const helpers = require('../../lib/helpers');
const { System } = require('../../models');
const { Conduit } = require('../../models');
const RestApiError = require('../../lib/error');

const conduitReqdFields = [
  'suriApiKey',
  'suriType',
  'suri',
];

const conduitOptFields = [
  'suriObjectKey', // nulls allowed
  'throttle', // default: true
  'status', // default: inactive
  'description', // nulls allowed
  'hiddenFormField', // default: []
  'allowlist', // default: []
  'racm', // default: []
];

// add conduit
router.post('/', auth.required, async function (req, res, next) {
  const conduit = new Conduit();
  const errors = {};

  conduit.userId = req.payload.id;
  conduit.curi = await helpers.makeCuri(System.cconf.settings.prefix);

  helpers.processInput(
    await req.body.conduit,
    conduitReqdFields,
    conduitOptFields,
    conduit,
    errors
  );

  if (Object.keys(errors).length) return next(new RestApiError(422, errors));

  try { await conduit.save(); } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(422).json({ error });
    }
    // In case the generated curi is a duplicate, we try once more
    if (error.name === 'SequelizeUniqueConstraintError') {
      conduit.curi = await helpers.makeCuri(System.cconf.settings.prefix);
      await conduit.save();
    } else return next(error);
  };

  return res.status(201).json({
    conduit: {
      id: conduit.id,
      curi: conduit.curi
    }
  });
});

// Get conduit
router.get('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({
      where: {
        id: req.params.id,
        userId: req.payload.id
      }
    });
    if (!conduit) return next(new RestApiError(404, 'conduit not found'));

    return res.json({ conduit: conduit.toJSON() });
  } catch (error) { next(error); }
});

// Get all conduits + batch (start & count)
// TODO: add ACL/scope check when integrated with OAuth2
// For now we are hacking to support proxy-server functionality
// without adding complexity
router.get('/', auth.required, async (req, res, next) => {
  try {
    let conduits = undefined;
    if (typeof req.query.start !== 'undefined' &&
        typeof req.query.count !== 'undefined'
    ) {
      conduits = await Conduit.findAll({
        where: {
          id: {
            [Op.gte]: req.query.start,
            // sgk: Prefix + to convert from string to number
            [Op.lt]: +req.query.start + +req.query.count,
          },
          userId: req.payload.id,
        }
      });
    } else {
      if (req.app.locals.proxyUser &&
          req.app.locals.proxyUser.id === req.payload.id
      ) {
        // fetch conduits in active status; check status enums in model.js
        conduits = await Conduit.findAll({ where: { status: 'active' } });
      } else {
        conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
      }
    }

    if (!conduits) return res.sendStatus(404);

    return res.json({ conduits: conduits.map(i => i.toJSON()) });
  } catch (error) { next(error); }
});

// Replace conduit
router.put('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findByPk(req.params.id);
    if (!conduit) return res.sendStatus(404);
    if (req.body.conduit.curi) return res.sendStatus(400);

    const errors = {};
    const newCdt = new Conduit();
    const objCdt = newCdt.toJSON();
    delete objCdt.id;
    delete objCdt.curi;
    delete objCdt.userId;
    delete conduit.description;
    Object.assign(conduit, objCdt);

    helpers.processInput(
      req.body.conduit,
      conduitReqdFields,
      conduitOptFields,
      conduit,
      errors
    );

    if (Object.keys(errors).length) return res.status(422).json({ errors });

    await conduit.update(req.body.conduit);
    res.status(200).json({ conduit: conduit.toJSON() });
  } catch (error) { return next(error); }
});

// Update conduit
router.patch('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findByPk(req.params.id);
    if (!conduit) return res.sendStatus(404);
    if (req.body.conduit.curi) return res.sendStatus(400);

    await conduit.update(await req.body.conduit);
    return res.status(200).json({ conduit: conduit.toJSON() });
  } catch (error) { return next(error); }
});

// Delete conduit
router.delete('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({ where: { id: req.params.id } });
    if (!conduit) {
      return res.sendStatus(404); // not found
    }

    if (conduit.status === 'active') {
      return next(new RestApiError(403, 'cannot delete an active conduit'));
    }

    const count = await Conduit.destroy({ where: { id: req.params.id } });
    if (count === 1) {
      return res.status(200).json({ conduit: { id: req.params.id } });
    }

    next(new Error('Unexpected error while removing an inactive conduit'));
  } catch (error) { return next(error); }
});

module.exports = router;
