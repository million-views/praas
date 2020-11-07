const router = require('express').Router();
const { body, param } = require('express-validator');
const auth = require('../auth');
const UserController = require('../../controllers/user');
const AuthenticationController = require('../../controllers/authentication');

router.get('/me', auth.required, UserController.getOwn);

router.get(
  '/users/:id',
  auth.required,
  [
    param('id')
      .notEmpty()
      .withMessage('User Id cannot be empty')
      .bail()
      .toInt(10),
  ],
  UserController.validate,
  UserController.getById
);

// Registration
router.post(
  '/users',
  [
    body('firstName')
      .exists()
      .withMessage('First name is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .exists()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('email')
      .exists()
      .withMessage('Email is required')
      .bail()
      .normalizeEmail()
      .isEmail()
      .withMessage('Invalid email address'),
    body('password')
      .exists()
      .withMessage('Passsword is required')
      .bail()
      .isLength({ min: 8 })
      .withMessage('Password should be atleast 8 characters long'),
  ],
  UserController.validate,
  UserController.create
);

// Update User
router.put(
  '/users/:id',
  auth.required,
  [
    body('firstName')
      .exists()
      .withMessage('First name is required')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .exists()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('email')
      .exists()
      .withMessage('Email is required')
      .bail()
      .normalizeEmail()
      .isEmail()
      .withMessage('Invalid email address'),
  ],
  UserController.validate,
  UserController.update
);

// Authentication
router.post(
  '/users/login',
  body('username')
    .exists()
    .withMessage('Username/Email is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Username/Email cannot be empty'),
  body('password')
    .exists()
    .withMessage('Passsword is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password should be atleast 8 characters long'),
  AuthenticationController.validate,
  AuthenticationController.login
);

/**
 * TODO:
 * PATCH
 * DELETE
 */

module.exports = router;
