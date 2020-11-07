const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const AuthenticationController = require('./controllers/authentication');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async function (username, password, done) {
      let error = null;
      try {
        const login = await AuthenticationController.exists(
          username,
          password
        );
        if (login && login.user) {
          return done(null, login.user);
        } else if (login && !login.user) {
          return done(null, null, {
            user: 'User details missing.',
          });
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
