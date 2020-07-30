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

  if (
    (conduit.suriType === 'Airtable' && conduit.suri !== 'https://api.airtable.com/v0/') ||
    (conduit.suriType === 'Google Sheets' && conduit.suri !== 'https://docs.google.com/spreadsheets/d/') ||
    (conduit.suriType === 'Smartsheet' && conduit.suri !== 'https://api.smartsheet.com/2.0/sheets')) {
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
const sortable = [
  'createdAt', 'createdAt', 'description', 'status', 'id', 'curi',
];

router.get('/', auth.required, async (req, res, next) => {
  const query = req.query;
  try {
    let conduits = undefined;
    const start = Number(query.start), count = Number(query.count);
    const proxyUser = req.app.locals.proxyUser;
    // console.log('sort  --->>>', query.sort, 'type', typeof query.sort);
    // 1. what fields are sortable
    // 2. how to create the order clause from query parameters
    // 3. how should the query parameters be designed for DX
    //  - we support array form and string form as below
    //  -- GET /users?sort=last modified:asc&sort=email address:desc
    //  -- GET /users?sort=last modified:asc,email address:desc
    //  -- chai/super-agent array form:
    //  ---- .query({sort: ['description:desc', 'id:asc']})
    // 4.1 how to transmit the sort query parameters in a test
    // 4.2 how to test the response
    let order = undefined;

    if (query.sort) {
      if (typeof query.sort === 'string') {
        query.sort = query.sort.split(',');
      }

      if (Array.isArray(query.sort)) {
        // TODO:
        // - check if `f` is in sortable list (see #1)
        // - check that 'value' after ':' is in ['asc', 'desc']
        // - if both are valid then return [fname, order]
        // - else return empty array
        // - reduce out empty arrays out from map
        order = query.sort.map(f => {
          const check = f.trim().split(':');
          if (sortable.includes(check[0]) && check[1].match(/asc|desc/i)) {
            return check;
          }
          console.log('unknown or bad sortable: ', check);
          return [];
        });
      }

      order = order.filter(f => f.length);

      // CODING CHALLENGE:
      // - replace map and filter with a single for-loop
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
        order
      });
    } else if (Number.isSafeInteger(start) && Number.isSafeInteger(count) && order !== undefined) {
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
      } else if (order !== undefined) {
        conduits = await Conduit.findAll({
          where: { userId: req.payload.id },
          order
        });
      } else {
        conduits = await Conduit.findAll({
          where: { userId: req.payload.id }
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

    if (
      (conduit.suriType === 'Airtable' && conduit.suri !== 'https://api.airtable.com/v0/') ||
      (conduit.suriType === 'Google Sheets' && conduit.suri !== 'https://docs.google.com/spreadsheets/d/') ||
      (conduit.suriType === 'Smartsheet' && conduit.suri !== 'https://api.smartsheet.com/2.0/sheets')) {
      return next(new RestApiError(422, { suri: 'unsupported' }));
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

    if (
      (conduit.suriType === 'Airtable' && conduit.suri !== 'https://api.airtable.com/v0/') ||
      (conduit.suriType === 'Google Sheets' && conduit.suri !== 'https://docs.google.com/spreadsheets/d/') ||
      (conduit.suriType === 'Smartsheet' && conduit.suri !== 'https://api.smartsheet.com/2.0/sheets')) {
      return next(new RestApiError(422, { suri: 'unsupported' }));
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
