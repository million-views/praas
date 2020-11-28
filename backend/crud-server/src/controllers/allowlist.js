const { validationResult } = require('express-validator');
const { Account, Allowlist } = require('../models');
const { RestApiError } = require('../../../lib/error');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new RestApiError(422, errors.array()));
  }
  next();
};

const authorize = async (req, res, next) => {
  if (req.payload.role === 'super-admin') {
    req.filters = {};
    next();
  } else {
    const accountId = parseInt(req.payload.accountId, 10);
    req.filters = { account_id: accountId };
    next();
  }
};

const getAll = async (req, res, next) => {
  try {
    const allowlist = await Allowlist.findAll({
      where: { ...req.filters },
    });
    const allowlistJson = allowlist.map((listitem) => listitem.toJSON());
    return res.json(allowlistJson);
  } catch (error) {
    next(new RestApiError(500, error));
  }
};

const getById = async (req, res, next) => {};

const create = async (req, res, next) => {
  const accountId = parseInt(req.payload.accountId, 10);
  const { ip, active, description } = req.body;
  const allowlistData = {
    ip,
    active,
    description,
  };

  try {
    const account = await Account.findOne({
      where: { id: accountId },
    });

    if (!account) {
      return next(new RestApiError(422, { account: 'Invalid account' }));
    }

    const result = await account.createAllowlist(allowlistData);
    return res.json(result.toJSON());
  } catch (err) {
    const { name, errors: dberrors, fields } = err;
    console.log(err);
    const errors = {};

    return next(new RestApiError(500, errors));
  }
};

const update = async (req, res, next) => {
  const accountId = parseInt(req.payload.accountId, 10);

  const allowlist = await Allowlist.findByPk(req.params.id, {
    include: {
      model: Account,
      where: {
        id: accountId,
      },
    },
  });

  if (!allowlist) {
    return next(new RestApiError(404, { allowlist: 'not found' }));
  }

  try {
    const updatedAllowlist = await allowlist.update(req.body);
    const { account, ...response } = updatedAllowlist.toJSON();
    res.json(response);
  } catch (err) {
    console.log(err);
    const { name, errors: dberrors, fields } = err;
    return next(new RestApiError(500, dberrors));
  }
};

const deleteAllowlist = async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const allowlist = await Allowlist.findByPk(req.params.id, {
      include: {
        model: Account,
        where: {
          id: accountId,
        },
      },
    });

    if (allowlist) {
      // TODO: should destroy only if not linked to ant conduit?
      allowlist.destroy();
    }

    res.json({
      id: req.params.id,
      status: 'Deleted',
    });
  } catch (err) {
    const { name, errors: dberrors, fields } = err;
    console.log(err);
    return next(new RestApiError(500, dberrors));
  }
};

module.exports = {
  validate,
  authorize,
  getAll,
  // getById,
  create,
  update,
  delete: deleteAllowlist,
};
