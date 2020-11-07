const router = require('express').Router();
const { Op } = require('sequelize');
const { body, param } = require('express-validator');
const { db, Account, Conduit, Allowlist } = require('../../models');
const conf = require('../../../../config');
const { RestApiError } = require('../../../../lib/error');

const conduitController = require('../../controllers/conduit');

const racmOptions = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
router.get(
  '/conduits',
  conduitController.validate,
  conduitController.authorize,
  conduitController.getAll
);

router.get(
  '/conduits/:id',
  conduitController.validate,
  conduitController.authorize,
  conduitController.getById
);

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
  conduitController.validate,
  conduitController.authorize,
  conduitController.validateRACM,
  conduitController.create
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
  conduitController.validate,
  conduitController.authorize,
  conduitController.validateRACM,
  conduitController.update
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
  conduitController.validate,
  conduitController.authorize,
  conduitController.delete
);

module.exports = router;
