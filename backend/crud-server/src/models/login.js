const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const UserModel = require('./user');

module.exports = (db, DataTypes) => {
  const User = UserModel(db, DataTypes);
  const Login = db.define('login', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      unique: true,
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true,
      },
      set(val) {
        this.setDataValue('salt', crypto.randomBytes(16).toString('hex'));
        this.setDataValue('hash', generateHash(val, this.salt));
      },
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  const generateHash = (val, salt) => {
    return crypto.pbkdf2Sync(val, salt, 10000, 512, 'sha512').toString('hex');
  };

  Login.prototype.passwordValid = function (password) {
    const hash = generateHash(password, this.salt);
    return this.hash === hash;
  };

  Login.exists = async function (email, password) {
    const userLogin = await Login.findOne({
      where: { username: email },
      include: {
        model: User,
      },
    });

    if (!userLogin || !userLogin.passwordValid(password)) {
      return undefined;
    }
    return userLogin;
  };

  return Login;
};
