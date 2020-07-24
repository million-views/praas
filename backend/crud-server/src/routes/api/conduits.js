const router = require('express').Router();
const { Op } = require('sequelize');

const auth = require('../auth');
const helpers = require('../../../../lib/helpers');
const conf = require('../../../../config');
const { Conduit } = require('../../models');
const { RestApiError } = require('../../../../lib/error');

const conduitReqdFields = ['suriApiKey', 'suriType', 'suri', 'suriObjectKey'];

const conduitOptFields = [
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
  conduit.curi = await helpers.makeCuri(conf.conduit.settings.prefix);

  helpers.processInput(
    await req.body.conduit,
    conduitReqdFields,
    conduitOptFields,
    conduit,
    errors
  );

  if (Object.keys(errors).length) {
    return next(new RestApiError(422, errors));
  }

  // console.log('Inside conduits POST 1- suriType:', conduit.suriType);
  // console.log('Inside conduits POST 2- suri:', conduit.suri);
  // console.log('Inside conduits POST 3- suriObjectKey:', conduit.suriObjectKey);

  if (conduit.suriType === 'Airtable' && conduit.suri !== 'https://api.airtable.com/v0/') {
    return next(new RestApiError(422, { suri: 'unsupported' }));
  }
  if (conduit.suriType === 'Google Sheets' && conduit.suri !== 'https://docs.google.com/spreadsheets/d/') {
    return next(new RestApiError(422, { suri: 'unsupported' }));
  }
  if (conduit.suriType === 'Smartsheet' && conduit.suri !== 'https://api.smartsheet.com/2.0/sheets') {
    return next(new RestApiError(422, { suri: 'unsupported' }));
  }

  try {
    await conduit.save();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return next(new RestApiError(422, error));
    }
    // In case the generated curi is a duplicate, we try once more
    if (error.name === 'SequelizeUniqueConstraintError') {
      conduit.curi = await helpers.makeCuri(conf.conduit.settings.prefix);
      await conduit.save();
    } else {
      return next(new RestApiError(500, error));
    }
  }

  return res.status(201).json({
    conduit: {
      id: conduit.id,
      curi: conduit.curi,
    },
  });
});

// Get conduit
router.get('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({
      where: {
        id: req.params.id,
        userId: req.payload.id,
      },
    });

    if (!conduit) {
      return next(new RestApiError(404, { conduit: 'not found' }));
    }

    return res.json({ conduit: conduit.toJSON() });
  } catch (error) {
    next(new RestApiError(500, error));
  }
});

// Get all conduits + batch (start & count)
// TODO:
// - add ACL/scope check when integrated with OAuth2; for now we are hacking
//   to support proxy-server functionality without adding complexity
// - revisit to make sure we catch all nuances of proper pagination
// - should we add a limit when there is no start or count?
router.get('/', auth.required, async (req, res, next) => {
  const query = req.query;
  try {
    let conduits = undefined;
    const start = Number(query.start), count = Number(query.count);
    const proxyUser = req.app.locals.proxyUser;

    if (Number.isSafeInteger(start) && Number.isSafeInteger(count)) {
      conduits = await Conduit.findAll({
        where: {
          id: {
            [Op.gte]: start,
            [Op.lt]: start + count,
          },
          userId: req.payload.id,
        },
      });
    } else {
      if (proxyUser && proxyUser.id === req.payload.id) {
        // fetch conduits in active status; check status enums in model.js
        conduits = await Conduit.findAll({ where: { status: 'active' } });
      } else {
        conduits = await Conduit.findAll({ where: { userId: req.payload.id } });
      }
    }

    if (!conduits) {
      return next(new RestApiError(404, { conduit: 'not found' }));
    }

    return res.json({ conduits: conduits.map((i) => i.toJSON()) });
  } catch (error) {
    next(new RestApiError(500, error));
  }
});

// Replace conduit
router.put('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findByPk(req.params.id);
    if (!conduit) {
      return next(new RestApiError(404, { conduit: 'not found' }));
    }

    if (req.body.conduit.curi) {
      return next(
        new RestApiError(403, { conduit: 'is immutable' })
      );
    }

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

    if (Object.keys(errors).length) {
      return next(new RestApiError(422, errors));
    }

    await conduit.update(req.body.conduit);
    res.status(200).json({ conduit: conduit.toJSON() });
  } catch (error) {
    return next(new RestApiError(500, error));
  }
});

// Update conduit
router.patch('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findByPk(req.params.id);
    if (!conduit) {
      return next(new RestApiError(404, { conduit: 'not found' }));
    }

    if (req.body.conduit.curi) {
      return next(
        new RestApiError(403, { conduit: 'is immutable' })
      );
    }

    await conduit.update(await req.body.conduit);
    return res.status(200).json({ conduit: conduit.toJSON() });
  } catch (error) {
    return next(new RestApiError(500, error));
  }
});

// Delete conduit
router.delete('/:id', auth.required, async (req, res, next) => {
  try {
    const conduit = await Conduit.findOne({ where: { id: req.params.id } });
    if (!conduit) {
      return next(new RestApiError(404, { conduit: 'not found' }));
    }

    if (conduit.status === 'active') {
      return next(
        new RestApiError(403, { conduit: 'cannot delete when active' })
      );
    }

    const count = await Conduit.destroy({ where: { id: req.params.id } });
    if (count <= 1) {
      // less than 1 is okay; indicates some other client removed it!
      return res.status(200).json({ conduit: { id: req.params.id } });
    }

    // we have a serious error and we should abort rather than continue
    console.error('== unexpected error while removing an active conduit ==');
    console.error('== count: ', count);
    console.error('== request:', req);
    process.exit(911);
  } catch (error) {
    return next(new RestApiError(500, error));
  }
});

module.exports = router;
