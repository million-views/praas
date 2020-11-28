const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const { Account, Secret } = require('../../models');

const { RestApiError } = require('../../../../lib/error');

const SecretsController = require('../../controllers/secrets');

router.get('/secrets', SecretsController.getAll);

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
  SecretsController.validate,
  SecretsController.authorize,
  SecretsController.create
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
  SecretsController.validate,
  SecretsController.authorize,
  SecretsController.update
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
  SecretsController.validate,
  SecretsController.authorize,
  SecretsController.delete
);

module.exports = router;
