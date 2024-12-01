const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load Pracownik model
const Pracownik = require('../../models/Pracownik.js');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'login', passwordField: 'password' },(login, password, done) => {
      Pracownik.findOne({
        login: login
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Nieprawidłowy login' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Hasło nieprawidłowe' });
          }
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    Pracownik.findById(id, (err, user) => {
      done(err, user);
    });
  });
};