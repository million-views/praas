const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const { Account, Secret } = require('../../models');

const { RestApiError } = require('../../../../lib/error');

router.get('/secrets', async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const secrets = await Secret.findAll({
      where: { account_id: accountId },
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
});

// Registration
router.post(
  '/secrets',
  [
    body('alias')
      .exists()
      .withMessage('Alias is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Alias cannot be empty'),
    body('token')
      .exists()
      .withMessage('Token is required')
      .bail()
      .notEmpty()
      .withMessage('Token cannot be empty'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

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
  }
);

// Update User
router.put(
  '/secrets/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Secrets id cannot be empty')
      .bail()
      .toInt(10),
    body('alias')
      .exists()
      .withMessage('Alias is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Alias cannot be empty'),
    body('token')
      .exists()
      .withMessage('Token is required')
      .bail()
      .notEmpty()
      .withMessage('Token cannot be empty'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

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
  }
);

// Delete Secret
router.delete(
  '/secrets/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Secrets id cannot be empty')
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
  }
);

module.exports = router;
