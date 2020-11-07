const { generateHash, generateSalt } = require('../utils');
module.exports = (db, DataTypes) => {
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
        this.setDataValue('salt', generateSalt());
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

  Login.prototype.passwordValid = function (password) {
    const hash = generateHash(password, this.salt);
    return this.hash === hash;
  };

  return Login;
};
