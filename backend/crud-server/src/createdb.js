const { db, User, Account } = require('./models');
const { Op } = require('sequelize');

const createdb = async () => {
  try {
    await db.sync({ force: true });
    /* TODO: Could be converted to a user controller later */
    await db.transaction(async (t) => {
      const userData = {
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'admin@praas.com',
      };

      const loginData = {
        username: 'admin@praas.com',
        password: 'praas1234',
      };

      const user = await User.create(userData, { transaction: t });
      await user.createLogin(loginData, { transaction: t });
      await user.createAccount(
        { name: 'Personal Account', plan: 'root' },
        { transaction: t }
      );

      return true;
    });
  } catch (error) {
    console.log('Error!', error);
    return error;
  }
};

module.exports = {
  dbSync: createdb(),
};
