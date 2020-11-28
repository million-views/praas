const { validationResult } = require('express-validator');
const { Account, Secret, Allowlist } = require('../models');
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
    const secrets = await Secret.findAll({
      where: { ...req.filters },
      attributes: {
        exclude: ['token'],
      },
    });
    const secretsJson = secrets.map((secret) => secret.toJSON());
    return res.json(secretsJson);
  } catch (error) {
    console.log(error);
    next(new RestApiError(500, error));
  }
};

const getById = async (req, res, next) => {};

const create = async (req, res, next) => {
  const accountId = parseInt(req.payload.accountId, 10);
  const { alias, token } = req.body;
  const secretData = {
    alias,
    token, // TODO: Better to store them encrypted
  };

  try {
    const account = await Account.findOne({
      where: { id: accountId },
    });

    if (!account) {
      return next(new RestApiError(422, { account: 'Invalid account' }));
    }

    const result = await account.createSecret(secretData);
    // Sequelize does not to filter data on create. Remove token from the response
    const { token, ...secret } = result.toJSON();
    return res.json(secret);
  } catch (err) {
    const { name, errors: dberrors, fields } = err;

    console.log(err);
    const errors = {};
    if (name === 'SequelizeUniqueConstraintError') {
      for (let i = 0; i < fields.length; i++) {
        errors[fields[i]] = dberrors[i].message;
      }
      return next(new RestApiError(422, errors));
    } else {
      errors.unknown = `unknown error ${name}, please contact support`;
      return next(new RestApiError(500, errors));
    }
  }
};

const update = async (req, res, next) => {
  const accountId = parseInt(req.payload.accountId, 10);

  const result = await Secret.findByPk(req.params.id, {
    include: {
      model: Account,
      where: {
        id: accountId,
      },
    },
  });

  if (!result) {
    return next(new RestApiError(404, { secret: 'not found' }));
  }

  try {
    const updatedSecret = await result.update(req.body);
    const { token, account, ...secret } = updatedSecret.toJSON();

    res.json(secret);
  } catch (err) {
    console.log(err);
    const { name, errors: dberrors, fields } = err;
    if (name === 'SequelizeUniqueConstraintError') {
      for (let i = 0; i < fields.length; i++) {
        errors[fields[i]] = dberrors[i].message;
      }
      return next(new RestApiError(422, errors));
    } else {
      console.log(err);
      errors.unknown = `unknown error ${name}, please contact support`;
      return next(new RestApiError(500, errors));
    }
  }
};

const deleteSecret = async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const secret = await Secret.findByPk(req.params.id, {
      include: {
        model: Account,
        where: {
          id: accountId,
        },
      },
    });

    if (secret) {
      secret.destroy();
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
  delete: deleteSecret,
};
