const { db, User } = require('./models');

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
        password: 'praas',
      };

      const user = await User.create(userData, { transaction: t });
      await user.createLogin(loginData, { transaction: t });
      await user.createAccount(
        { name: 'Personal Account', plan: 'root' },
        { transaction: t }
      );

      console.log('Done!');
      return true;
    });
  } catch (error) {
    console.log('Error!', error);
    return error;
  }
};

const dbSync = db
  .sync({ force: true })
  .then(() => {
    return User.create(user);
  })
  .catch((err) => {
    return err;
  });

module.exports = {
  dbSync: createdb(),
};
