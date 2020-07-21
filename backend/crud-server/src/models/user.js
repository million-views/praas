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
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
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
    password: {
      type: DataTypes.VIRTUAL,
      set(val) {
        this.setDataValue('salt', crypto.randomBytes(16).toString('hex'));
        this.setDataValue('hash', crypto
          .pbkdf2Sync(val, this.salt, 10000, 512, 'sha512')
          .toString('hex'));
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
    const payload = {
      id: this.id,
      email: this.email,
      exp: parseInt(exp.getTime() / 1000),
    };

    return jwt.sign(payload, config.system.settings.secret);
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

  // find a user using e-mail address and validate password
  // if found and password matches, return the user object
  // else return falsey...
  // WARN: watchout for collisions with Sequelize's own class methods
  User.exists = async function(email, password) {
    const user = await User.findOne({ where: { email: email } });
    if (!user || !user.passwordValid(password)) {
      return undefined;
    }

    return user;
  };

  return User;
};
