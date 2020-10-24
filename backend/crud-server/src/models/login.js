const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const UserModel = require('./user');
const AccountModel = require('./account');
const MembershipModel = require('./membership');
const { required } = require('../routes/auth');

module.exports = (db, DataTypes) => {
  const User = UserModel(db, DataTypes);
  const Account = AccountModel(db, DataTypes);
  const Membership = MembershipModel(db, DataTypes);
  User.belongsToMany(Account, { through: Membership });
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

  return Login;
};
