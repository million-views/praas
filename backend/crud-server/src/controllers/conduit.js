const { validationResult } = require('express-validator');
const { db, Account, Conduit, Allowlist } = require('../models');
const { RestApiError } = require('../../../lib/error');

const racmOptions = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];

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
    const conduits = await Conduit.findAll({
      where: { ...req.filters },
      include: {
        model: Allowlist,
      },
    });

    const conduitsJson = conduits.map((conduit) => {
      return {
        ...conduit.toJSON(),
        allowlists: conduit.allowlists.map((allowlist) => allowlist.toJSON()),
      };
    });
    return res.json(conduitsJson);
  } catch (error) {
    next(new RestApiError(500, error));
  }
};

const getById = async (req, res, next) => {
  try {
    const conduit = await Conduit.findByPk(req.params.id, {
      where: { ...req.filters },
      include: {
        model: Allowlist,
      },
    });

    return res.json(conduit.toJSON());
  } catch (error) {
    next(new RestApiError(500, error));
  }
};

const validateRACM = (req, res, next) => {
  const { racm } = req.body;

  if (Array.isArray(racm)) {
    if (
      !racm.every((item) => item && racmOptions.includes(item.toUpperCase()))
    ) {
      return next(
        new RestApiError(422, {
          racm: 'Invalid RACM methods',
        })
      );
    }
  }

  next();
};

const create = async (req, res, next) => {
  const {
    resourceType,
    objectPath,
    accessToken,
    active,
    racm,
    allowlist,
    description,
  } = req.body;

  const conduitData = {
    resourceType,
    objectPath,
    racm,
    active,
    description,
  };

  try {
    const accountId = parseInt(req.payload.accountId, 10);
    const account = await Account.findByPk(accountId);

    if (!account) {
      return next(new RestApiError(422, { account: 'Invalid account' }));
    }

    const result = await db.transaction(async (t) => {
      const conduit = await account.createConduit(conduitData, {
        transaction: t,
      });

      const secrets = await account.getSecrets(
        {
          where: {
            id: accessToken,
          },
        },
        { transaction: t }
      );

      if (secrets.length) {
        secrets[0].addConduit(conduit, { transaction: t });
      } else {
        return next(
          new RestApiError(422, { accessToken: 'Invalid access token' })
        );
      }

      const setAllowList = async (allowlist) => {
        if (Array.isArray(allowlist) && allowlist.length) {
          const list = await account.getAllowlists(
            {
              where: {
                id: allowlist,
              },
            },
            { transaction: t }
          );
          return await conduit.addAllowlists(list, {
            transaction: t,
          });
        }
        return [];
      };

      const savedAllowList = await setAllowList(allowlist);

      return { conduit, secret: secrets[0], allowlist: savedAllowList };
    });

    const { token, ...secret } = result.secret.toJSON();
    const response = {
      ...result.conduit.toJSON(),
      accessToken: secret,
      allowlist: result.allowlist.map((item) => item.toJSON()),
    };
    return res.json(response);
  } catch (err) {
    const { name, errors: dberrors, fields } = err;
    const errors = {};

    return next(new RestApiError(500, errors));
  }
};

const update = async (req, res, next) => {
  const {
    resourceType,
    objectPath,
    accessToken,
    active,
    racm,
    allowlist,
    description,
  } = req.body;

  const conduitData = {
    resourceType,
    objectPath,
    racm: racm,
    active,
    description,
  };

  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const account = await Account.findByPk(accountId, {
      include: {
        model: Conduit,
        required: true,
        attributes: {
          exclude: ['throttle', 'secretId'],
        },
        where: {
          id: req.params.id,
        },
      },
    });

    if (!account) {
      return next(new RestApiError(422, { account: 'Invalid account' }));
    }

    if (Array.isArray(account.conduits) && account.conduits.length > 0) {
      const conduit = account.conduits[0];

      const result = await db.transaction(async (t) => {
        const updatedConduit = await conduit.update(conduitData, {
          transaction: t,
        });

        const secrets = await account.getSecrets(
          {
            where: {
              id: accessToken,
            },
          },
          { transaction: t }
        );

        if (secrets.length) {
          secrets[0].addConduit(updatedConduit, { transaction: t });
        } else {
          return next(
            new RestApiError(422, { accessToken: 'Invalid access token' })
          );
        }

        const updateAllowlist = async (allowlist) => {
          if (Array.isArray(allowlist) && allowlist.length) {
            const alist = await conduit.getAllowlists();
            await conduit.removeAllowlists(alist, { transaction: t });

            const list = await account.getAllowlists(
              {
                where: {
                  id: allowlist,
                },
              },
              { transaction: t }
            );

            return await conduit.addAllowlists(list, {
              transaction: t,
            });
          }
          return [];
        };

        const savedAllowList = await updateAllowlist(allowlist);

        return { conduit, secret: secrets[0], allowlist: savedAllowList };
      });

      const { token, ...secret } = result.secret.toJSON();
      const response = {
        ...result.conduit.toJSON(),
        accessToken: secret,
        allowlist: result.allowlist.map((item) => item.toJSON()),
      };
      return res.json(response);
    } else {
      return next(new RestApiError(422, { conduit: 'Conduit not found' }));
    }
  } catch (err) {
    console.log(err);
    const { name, errors: dberrors, fields } = err;
    console.log(err, err.sql);
    const errors = {};

    return next(new RestApiError(500, errors));
  }
};

const deleteConduit = async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const conduit = await Conduit.findByPk(req.params.id, {
      include: {
        model: Account,
        where: {
          id: accountId,
        },
      },
    });

    if (conduit) {
      // TODO: should destroy only if not linked to ant conduit?
      conduit.destroy();
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
  getById,
  validateRACM,
  create,
  update,
  delete: deleteConduit,
};
