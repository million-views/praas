const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const { Account, Allowlist } = require('../../models');

const { RestApiError } = require('../../../../lib/error');

router.get('/allowlist', async (req, res, next) => {
  try {
    const accountId = parseInt(req.payload.accountId, 10);

    const allowlist = await Allowlist.findAll({
      where: { account_id: accountId },
    });
    const allowlistJson = allowlist.map((listitem) => listitem.toJSON());
    return res.json(allowlistJson);
  } catch (error) {
    next(new RestApiError(500, error));
  }
});

// Registration
router.post(
  '/allowlist',
  [
    body('ip')
      .exists()
      .withMessage('IP is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('IP cannot be empty')
      .isIP()
      .withMessage('Invalid  IP address'),
    body('status')
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
    const { ip, status, description } = req.body;
    const allowlistData = {
      ip,
      status,
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
  }
);

// Update User
router.put(
  '/allowlist/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Allowlist id cannot be empty')
      .bail()
      .toInt(10),
    body('ip')
      .exists()
      .withMessage('IP is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('IP cannot be empty')
      .isIP()
      .withMessage('Invalid  IP address'),
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
      res.json(updatedAllowlist.toJSON());
    } catch (err) {
      console.log(err);
      const { name, errors: dberrors, fields } = err;
      return next(new RestApiError(500, dberrors));
    }
  }
);

// Delete Allowlist
router.delete(
  '/allowlist/:id',
  [
    param('id')
      .notEmpty()
      .withMessage('Allowlist id cannot be empty')
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
  }
);

module.exports = router;
