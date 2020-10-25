const router = require('express').Router();
const { Op } = require('sequelize');
const { body, param, validationResult } = require('express-validator');
const { db, Account, Conduit, Allowlist } = require('../../models');
const conf = require('../../../../config');
const { RestApiError } = require('../../../../lib/error');

const racmOptions = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
router.get('/conduits', async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const conduits = await Conduit.findAll({
      where: { account_id: accountId },
    });
    const conduitsJson = conduits.map((conduit) => conduit.toJSON());
    return res.json(conduitsJson);
  } catch (error) {
    next(new RestApiError(500, error));
  }
});

// Registration
router.post(
  '/conduits',
  [
    body('resourceType')
      .exists()
      .withMessage('Resource type is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Resource type cannot be empty')
      .isIn(conf.targets.settings.map((i) => i.type)), // Ideally not to be here
    body('accessToken') // Array
      .exists()
      .withMessage('Access token is required')
      .bail()
      .notEmpty()
      .withMessage('Access token cannot be empty')
      .toInt(10),
    body('objectPath')
      .exists()
      .withMessage('Object path is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Object path cannot be empty'),
    body('racm') // Array
      .optional()
      .exists()
      .toArray(),
    body('allowlist') // Array
      .optional()
      .exists()
      .toArray(),
    body('active')
      .exists()
      .withMessage('Status is required')
      .bail()
      .toBoolean()
      .withMessage('Status should be boolean'),
    body('description')
      .optional()
      .exists()
      .withMessage('Description is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    const accountId = parseInt(req.payload.accountId, 10);
    const {
      resourceType,
      objectPath,
      accessToken,
      active,
      racm,
      allowlist,
      description,
    } = req.body;

    if (Array.isArray(racm)) {
      if (
        !racm.every(
          (item) => item && racmOptions.includes(item.toUpperCase())
        )
      ) {
        return next(
          new RestApiError(422, {
            racm: 'Invalid RACM methods',
          })
        );
      }
    }

    const conduitData = {
      resourceType,
      objectPath,
      racm: ['GET'],
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
      console.log(err);
      const { name, errors: dberrors, fields } = err;
      console.log(err, err.sql);
      const errors = {};

      return next(new RestApiError(500, errors));
    }
  }
);

router.put(
  '/conduits/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Conduit id cannot be empty')
      .bail()
      .toInt(10),
    body('resourceType')
      .exists()
      .withMessage('Resource type is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Resource type cannot be empty')
      .isIn(conf.targets.settings.map((i) => i.type)), // Ideally not to be here
    body('accessToken') // Array
      .exists()
      .withMessage('Access token is required')
      .bail()
      .notEmpty()
      .withMessage('Access token cannot be empty')
      .toInt(10),
    body('objectPath')
      .exists()
      .withMessage('Object path is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Object path cannot be empty'),
    body('racm') // Array
      .optional()
      .exists()
      .toArray(),
    body('allowlist') // Array
      .optional()
      .exists()
      .toArray(),
    body('active')
      .exists()
      .withMessage('Status is required')
      .bail()
      .toBoolean()
      .withMessage('Status should be boolean'),
    body('description')
      .optional()
      .exists()
      .withMessage('Description is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    const accountId = parseInt(req.payload.accountId, 10);
    const {
      resourceType,
      objectPath,
      accessToken,
      active,
      racm,
      allowlist,
      description,
    } = req.body;

    if (Array.isArray(racm)) {
      if (
        !racm.every(
          (item) => item && racmOptions.includes(item.toUpperCase())
        )
      ) {
        return next(
          new RestApiError(422, {
            racm: 'Invalid RACM methods',
          })
        );
      }
    }

    const conduitData = {
      resourceType,
      objectPath,
      racm: racm,
      active,
      description,
    };

    try {
      const account = await Account.findOne({
        where: { id: accountId },
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
  }
);

// Delete Allowlist
router.delete(
  '/conduits/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Conduit id cannot be empty')
      .bail()
      .toInt(10),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

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
  }
);

module.exports = router;
