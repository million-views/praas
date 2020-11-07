const router = require('express').Router();
const { body, param } = require('express-validator');
const conf = require('../../../../config');
const ConduitController = require('../../controllers/conduit');

router.get(
  '/conduits',
  ConduitController.validate,
  ConduitController.authorize,
  ConduitController.getAll
);

router.get(
  '/conduits/:id',
  ConduitController.validate,
  ConduitController.authorize,
  ConduitController.getById
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
  ConduitController.validate,
  ConduitController.authorize,
  ConduitController.validateRACM,
  ConduitController.create
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
  ConduitController.validate,
  ConduitController.authorize,
  ConduitController.validateRACM,
  ConduitController.update
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
  ConduitController.validate,
  ConduitController.authorize,
  ConduitController.delete
);

module.exports = router;
