const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

module.exports = (db, DataTypes) => {
  const User = db.define('user', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      unique: true,
    },
  });

  // valid for 1 hour
  User.prototype.generateJWT = function (exp, iat) {
    // TODO: Add account details
    const payload = {
      id: this.id,
      accountId: this.accounts[0].id,
      email: this.email,
      exp,
      iat,
    };

    return jwt.sign(payload, config.system.settings.secret);
  };

  User.prototype.toAuthJSON = function () {
    const iat = Math.floor(new Date().getTime() / 1000);
    const exp = iat + 3600; // valid for 1 hour
    // const exp = iat + 60; // valid for 60 seconds

    const tkn = this.generateJWT(exp, iat);
    return {
      id: this.id,
      accountId: this.accounts[0].id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      token: tkn,
      type: 'Bearer',
      expiresAt: exp,
    };
  };

  User.prototype.toProfileJSONFor = function () {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    };
  };

  // find a user using e-mail address and validate password
  // if found and password matches, return the user object
  // else return falsey...
  // WARN: watchout for collisions with Sequelize's own class methods
  User.exists = async function (email) {
    const user = await User.findOne({ where: { email: email } });

    return user;
  };

  return User;
};
