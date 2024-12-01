const _opts = {
    notLogged: {
        text: 'Zaloguj się aby mieć dostęp do tych zasobów',
        redirectPath: '/account/login',
        flash: 'error_msg'
    },
    notAdmin:{
        text: 'Dostęp do tych zasobów posiada tylko Administrator',
        redirectPath: '/account/login',
        flash: 'error_msg'
    },
    notKR: {
        text: 'Dostęp do tych zasobów posiada tylko Kierownik Restauracji',
        redirectPath: '/account/login',
        flash: 'error_msg'
    },
}

module.exports = {
    /**
     * Ensure user is authenticated
     * @description Sprawdza czy użytkownik jest aktualnie zalogowany, jeśli nie zostaje odesłany na wskazaną ścieżkę
     */
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash(_opts.notLogged.flash, _opts.notLogged.text);
      res.redirect(_opts.notLogged.redirectPath);
    },
    /**
     * Forward if authenticated
     * @description Odsyła zalogowanego użytkownika na stronę główną
     */
    forwardAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');      
    },
    /**
     * Ensure user have 'Admin' role
     * @description Sprawdza czy użytkownik posiada uprawnienia Admina, jeśli nie zostaje odesłany na wskazaną ścieżkę
     */
    ensureIsAdmin:  (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash(_opts.notLogged.flash, _opts.notLogged.text);
            return res.redirect(_opts.notLogged.redirectPath);
        }

        if (req.user.role == 'Admin') {
            req.flash(_opts.notAdmin.flash, _opts.notAdmin.text);
            return res.redirect(_opts.notAdmin.redirectPath);
        }
        
        return next();
    },
    /**
     * Ensure user have 'Admin' or 'Kierownik restauracji' role
     * @description Sprawdza czy użytkownik posiada uprawnienia Admina lub Kierownika Restauracji, jeśli nie zostaje odesłany na wskazaną ścieżkę
     */
    ensureIsKR:  (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash(_opts.notLogged.flash, _opts.notLogged);
            return res.redirect(_opts.notLogged.redirectPath);
        }

        if (req.user.role != 'Manager') {
            return next();
        }
        
        req.flash(_opts.notKR.flash, _opts.notKR.text);
        return res.redirect(_opts.notKR.redirectPath);
    },
  };