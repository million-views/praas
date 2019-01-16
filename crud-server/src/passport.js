const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function (email, password, done) {
  User.findOne({ where: { email: email } }).then(function (user) {
    // console.log('in findOne', user);
    if (!user || !user.passwordValid(password)) {
      return done(null, false, { errors: { credentials: 'email or password is invalid' } });
    }

    return done(null, user);
  }).catch(done);
}));
