const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (db, DataTypes) => {
  const User = db.define('user', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /\S+@\S+\.\S+/,
        notEmpty: true
      },
      unique: true,
      set(email) {
        this.setDataValue('email', email.toString().toLowerCase());
      }
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  User.prototype.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex');
  };

  User.prototype.passwordValid = function (password) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex');
    return this.hash === hash;
  };

  User.prototype.generateJWT = function () {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      id: this.id,
      email: this.email,
      exp: parseInt(exp.getTime() / 1000),
    }, config.secret);
  };

  User.prototype.toAuthJSON = function () {
    const tkn = this.generateJWT();

    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      token: tkn
    };
  };

  User.prototype.toProfileJSONFor = function () {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    };
  };

  return User;
};
