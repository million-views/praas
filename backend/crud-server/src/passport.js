const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    async function (email, password, done) {
      let error = null;
      try {
        const user = await User.exists(email, password);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            errors: { credentials: 'email or password is invalid' },
          });
        }
      } catch (e) {
        console.log('caught ', e);
        error = e;
      }

      return done(error);
    }
  )
);
