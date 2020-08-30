const router = require('express').Router();
const { Op } = require('sequelize');

const auth = require('../auth');
const helpers = require('../../../../lib/helpers');
const conf = require('../../../../config');
const { Conduit } = require('../../models');
const { RestApiError } = require('../../../../lib/error');

const conduitReqdFields = ['suriType', 'suriObjectKey', 'suriApiKey'];

const conduitOptFields = [
  'throttle', // default: true
  'status', // default: inactive
  'description', // nulls allowed
  'hiddenFormField', // default: []
  'allowlist', // default: []
  'racm', // default: []
];

// cache frequently used objects
const serviceTargets = conf.targets.settings.map((i) => i.type);

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

  if (serviceTargets.includes(req.body.conduit.suriType) === false) {
    return next(
      new RestApiError(422, {
        suriType: `'${req.body.conduit.suriType}' unsupported`,
      })
    );
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
const sortable = [
  'createdAt',
  'updatedAt',
  'description',
  'status',
  'id',
  'curi',
];

router.get('/', auth.required, async (req, res, next) => {
  const query = req.query;
  try {
    let conduits = undefined;
    const start = Number(query.start),
      count = Number(query.count);
    const proxyUser = req.app.locals.proxyUser;

    // sorting
    // default ordering is based on createdAt and updatedAt
    let order = [['updatedAt', 'DESC']];

    if (query.sort) {
      if (typeof query.sort === 'string') {
        query.sort = query.sort.split(',').map((sortItem) => sortItem.trim());
      }

      if (Array.isArray(query.sort)) {
        order = query.sort
          .filter((f) => {
            f = f.trim().split(':');
            if (sortable.includes(f[0]) && f[1].match(/asc|desc/i)) return f;
            return [];
          })
          .map((o) => {
            return o.split(':');
          });
      }
    }
    if (Number.isSafeInteger(start) && Number.isSafeInteger(count)) {
      conduits = await Conduit.findAll({
        where: {
          id: {
            [Op.gte]: start,
            [Op.lt]: start + count,
          },
          userId: req.payload.id,
        },
        order,
      });
    } else {
      if (proxyUser?.id === req.payload.id) {
        // fetch conduits in active status; check status enums in model.js
        conduits = await Conduit.findAll({
          where: { status: 'active' },
          order,
        });
      } else {
        conduits = await Conduit.findAll({
          where: { userId: req.payload.id },
          order,
        });
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
      return next(new RestApiError(403, { conduit: 'is immutable' }));
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

    if (serviceTargets.includes(req.body.conduit.suriType) === false) {
      return next(
        new RestApiError(422, {
          suriType: `'${req.body.conduit.suriType}' unsupported`,
        })
      );
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
      return next(
        new RestApiError(404, { conduit: `'${req.params.id}' not found` })
      );
    }

    if (req.body.conduit.curi) {
      return next(new RestApiError(403, { conduit: 'is immutable' }));
    }

    // FIXME!
    // Since the mode of access to supported service types is vastly
    // different, we should not allow service type for an existing
    // conduit to be changed. Tests, UI and this logic needs to
    // fixed
    if (
      req.body.conduit.suriType &&
      serviceTargets.includes(req.body.conduit.suriType) === false
    ) {
      return next(
        new RestApiError(422, {
          suriType: `'${req.body.conduit.suriType}' unsupported`,
        })
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
