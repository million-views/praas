const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, async function (email, password, done) {
  let error = null;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user || !user.passwordValid(password)) {
      return done(null, false, { errors: { credentials: 'email or password is invalid' } });
    } else {
      return done(null, user);
    }
  } catch (e) {
    console.log('caught ', e);
    error = e;
  }

  return done(error);
}));
