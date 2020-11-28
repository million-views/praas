const router = require('express').Router();
const { body, param } = require('express-validator');
const AllowlistController = require('../../controllers/allowlist');

router.get(
  '/allowlist',
  AllowlistController.authorize,
  AllowlistController.getAll
);

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
  AllowlistController.validate,
  AllowlistController.authorize,
  AllowlistController.create
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
  AllowlistController.validate,
  AllowlistController.authorize,
  AllowlistController.update
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
  AllowlistController.validate,
  AllowlistController.authorize,
  AllowlistController.delete
);

module.exports = router;
