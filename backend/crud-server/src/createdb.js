const { db, User } = require('./models');

db.sync({ force: true }).then(() => {
  const user = new User();

  user.firstName = 'Admin';
  user.lastName = 'Admin';
  user.email = 'admin@praas.com';
  user.password = 'praas';

  user.save();
});
