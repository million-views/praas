const { validationResult } = require('express-validator');
const { db, User } = require('../models');

const { RestApiError } = require('../../../lib/error');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new RestApiError(422, errors.array()));
  }
  next();
};

const getOwn = async (req, res, next) => {
  try {
    const userId = parseInt(req.payload.id, 10);

    const user = await User.findByPk(userId);
    if (!user) return next(new RestApiError(404, { user: 'not found' }));
    return res.json(await user.toAuthJSON());
  } catch (error) {
    console.log(error);
    next(new RestApiError(500, error));
  }
};

const getById = async (req, res, next) => {
  try {
    const userId = parseInt(req.payload.id, 10);
    const user = await User.findByPk(userId);
    if (!user) return next(new RestApiError(404, { user: 'not found' }));
    return res.json(await user.toAuthJSON());
  } catch (error) {
    next(new RestApiError(500, error));
  }
};

const create = async (req, res, next) => {
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
    const result = await db.transaction(async (t) => {
      const user = await User.create(userData, { transaction: t });

      await user.createLogin(loginData, { transaction: t });

      await user.createAccount(
        { name: 'Personal Account', plan: 'basic' },
        { transaction: t }
      );

      return user;
    });

    const userAuthJson = await result.toAuthJSON();
    return res
      .cookie('access_token', `Bearer ${userAuthJson.token}`, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
      })
      .json(userAuthJson);
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
};

const update = async (req, res, next) => {
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
};

module.exports = {
  validate,
  getOwn,
  getById,
  create,
  update,
};
