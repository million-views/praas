const { validationResult } = require('express-validator');
const passport = require('passport');
const { User, Login, Account } = require('../models');

const { RestApiError } = require('../../../lib/error');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new RestApiError(422, errors.array()));
  }
  next();
};

const exists = async function (email, password) {
  const userLogin = await Login.findOne({
    where: { username: email },
    include: {
      model: User,
      required: true,
      include: {
        model: Account,
        required: true,
      },
    },
  });

  if (!userLogin || !userLogin.passwordValid(password)) {
    return undefined;
  }
  return userLogin;
};

const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async function (
    err,
    user,
    info
  ) {
    if (err) {
      console.log('err: ', err);
      return next(new RestApiError(500, err));
    }

    if (user) {
      const userAuthJson = await user.toAuthJSON();
      return res
        .cookie('access_token', `Bearer ${userAuthJson.token}`, {
          expires: new Date(Date.now() + 8 * 3600000),
          httpOnly: true,
        })
        .json(userAuthJson);
    } else {
      return next(new RestApiError(422, info));
    }
  })(req, res, next);
};

module.exports = {
  validate,
  exists,
  login,
};
