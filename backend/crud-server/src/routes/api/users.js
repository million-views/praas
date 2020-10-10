const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../../models').db;
const User = require('../../models').User;
const auth = require('../auth');
const passport = require('passport');
const { RestApiError } = require('../../../../lib/error');

router.get('/me', auth.required, async (req, res, next) => {
  try {
    const userId = parseInt(req.payload.id, 10);

    const user = await User.findOne({ where: { id: userId } });
    if (!user) return next(new RestApiError(404, { user: 'not found' }));
    return res.json(user.toAuthJSON());
  } catch (error) {
    console.log(error);
    next(new RestApiError(500, error));
  }
});

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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    try {
      const userId = parseInt(req.payload.id, 10);
      const user = await User.findOne({ where: { id: userId } });
      if (!user) return next(new RestApiError(404, { user: 'not found' }));
      return res.json({ user: user.toAuthJSON() });
    } catch (error) {
      next(new RestApiError(500, error));
    }
  }
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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    const { firstName, lastName, email, password } = req.body;
    const userData = {
      firstName,
      lastName,
      email,
    };

    const loginData = {
      username: email,
      password,
    };

    try {
      /**
       * https://sequelize.org/master/manual/creating-with-associations.html
       * Preferable way, but does not confirm to a single transaction */

      const result = await db.transaction(async (t) => {
        const user = await User.create(userData, { transaction: t });

        await user.createLogin(loginData, { transaction: t });

        await user.createAccount(
          { name: 'Personal Account', plan: 'basic' },
          { transaction: t }
        );

        return user;
      });
      return res.json(result.toAuthJSON());
    } catch (err) {
      const { name, errors: dberrors, fields } = err;
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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new RestApiError(404, { user: 'not found' }));
    }

    try {
      const updatedUser = await user.update(req.body);
      res.json(updatedUser.toJSON());
    } catch ({ name, errors: dberrors, fields }) {
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new RestApiError(422, errors.array()));
    }

    passport.authenticate('local', { session: false }, function (
      err,
      user,
      info
    ) {
      if (err) {
        console.log('err: ', err);
        return next(new RestApiError(500, err));
      }

      if (user) {
        return res.json(user.toAuthJSON());
      } else {
        return next(new RestApiError(422, info));
      }
    })(req, res, next);
  }
);

/**
 * TODO:
 * PATCH
 * DELETE
 */

module.exports = router;
