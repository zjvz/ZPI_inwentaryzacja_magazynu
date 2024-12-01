const passport = require('passport');
const Pracownik = require('../models/Pracownik.js');
const bcrypt = require('bcryptjs');

module.exports = {
    /**
     * GET login page
     * @description Wyświetla stronę z formularzem logowania
     */
    getLoginPage: (req, res, next) => {
        res.render('account/login', { });
    },

    /**
     * POST login page
     * @description Przetwarza dane logowania z formularza
     */
    postLoginPage: (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/account/login',
            badRequestMessage: 'Wprowadź wszystkie dane',
            failureFlash: true
        })(req, res, next);
    },


    /**
     * GET logout page
     * @description Wylogowuje użytkownika jeśli ten był zalogowany
     */
    getLogout: (req, res, next) => {
        req.logout(err => {
            if(err)
                req.flash('error', 'Błąd podczas wylogowywania');
            req.flash('success_msg', 'Wylogowano');
            res.redirect('/account/login');
        });
    },


    /**
     * GET password reset page
     * @description Strona na której użytkownik resetuje swoje hasło
     */
    getPasswdResetPage: (req, res, next) => {
        if(req.user.passwordToReset == true)
            res.render('account/passReset', { user:req.user});
        else
            res.redirect('/');
    },

    /**
     * POST password reset page
     * @description Przetwarza dane z formularza resetowania hasła
     */
    postPasswdResetPage: (req, res, next) => {
        //Password reset logic goes here
        req.flash('success_msg', 'Prawidłowo zresetowano hasło');
        res.redirect('/');
    },

    /**
     * GET password change page
     * @description Strona na której użytkownik zmienia swoje hasło
     */
    getPasswdChangePage: (req, res, next) => {
        res.render('account/passChange', { user:req.user});
    },

    /**
     * POST password change page
     * @description Przetwarza dane z formularza zmieniania hasła
     */
    postPasswdChangePage: (req, res, next) => {
        //Password change logic goes here
        console.log(req.body);

        const { oldPassword, newPassword, newPasswordRepeat} = req.body;
        let errors = [];

        if (!oldPassword || !newPassword || !newPasswordRepeat) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

        if(oldPassword == newPassword){
            errors.push({ msg: 'Nowe hasło jest identyczne!' });
        }

        if(newPassword != newPasswordRepeat){
            errors.push({ msg: 'Wprowadź dwa razy to samo hasło!' });
        }

        /*if (newPassword.length < 8) {
            errors.push({ msg: 'Hasło musi składać się z przynajmniej 8 znaków' });
        }*/

        if(errors.length > 0)
            return res.render('account/passChange', { user: req.user, errors});

        Pracownik.findOne({ login: req.user.login }).then(pracownik => {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                    if (err) throw err;

                    pracownik.password = hash;

                    pracownik.save().then(user => {
                        req.flash('success_msg', `Prawidłowo zmieniono hasło!`);
                        return res.redirect('/account/profile');
                    }).catch(err => {
                        console.log(err);
                        req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
                        return res.render('account/passChange', { user: req.user, errors});
                    });
                });
            });
        });
    },


    /**
     * GET user profile page
     * @description Strona na której użytkownik może wyświetlić swoje dane
     */
    getProfilePage: (req, res, next) => {
        res.render('account/profile', { user:req.user});
    },
}