const passport = require('passport');
const Pracownik = require('../models/Pracownik.js');
const bcrypt = require('bcryptjs');

module.exports = {
    /**
     * GET Users list page
     * @description Wyświetla stronę z listą użytkowników
     */
    getUsersPage: (req, res, next) => {
        let users;
        Pracownik.find({}, (err, data) => {
            //console.log(data);
            i = 0;
            for(let d of data){
                data[i++]['password'] = '???';
            }
            users = data;
        });
        console.log(users);
        res.render('users/index', { user:req.user, data: users});
    },

    /**
     * GET Users list API
     * @description Zwraca listę użytkowników w formie json
     */
    getUsersApi: (req, res, next) => {
        Pracownik.find({}, (err, data) => {
            console.log(data);
            i = 0;
            for(let d of data){
                data[i++]['password'] = '???';
            }
            console.log(data);
            res.json(JSON.stringify(data));

        })
        //res.render('users/index', { });
    },

    /**
     * POST Users list API
     * @description Przetwarza dane z formularza edytowania użytkowników
     */
    postUsersApi: async (req, res, next) => {
        const { fName, lName, role, login, email, address, prevLogin, type} = req.body;
        if(type == "edit"){
            if (!prevLogin || !fName || !lName || !role || !login || !email || !address) {
                req.flash('error', 'Edytując użytkownika uzupełnij wszystkie pola!');
                return res.redirect('/users');
            }

            const pracownik = await Pracownik.findOneAndUpdate({login: prevLogin}, {fName, lName, role, login, email, address}, {new: true});
            if(pracownik){
                req.flash('success_msg', `Prawidłowo zaktualizowano pracownika ${prevLogin}`);
            }else{
                req.flash('error', 'Błąd podczas edytowania pracownika!');
            }
            return res.redirect('/users');
        }

        if(type == "remove"){
            if(!prevLogin){
                req.flash('error', 'Błąd podczas usuwania użytkownika!');
                return res.redirect('/users');
            }

            Pracownik.findOneAndRemove({login: prevLogin}, (err, pracownik) => {
                if(pracownik){
                    req.flash('success_msg', `Prawidłowo usunięto pracownika o loginie: ${pracownik.login}`);
                }else{
                    req.flash('error', 'Błąd podczas usuwania użytkownika!');
                }
                return res.redirect('/users');
            });
        }

        //req.flash('error', 'Błąd!');
        //res.send(JSON.stringify(req.body));
        //return res.redirect('/users');
        //res.render('users/index', { });
    },



    /**
     * GET Add user page
     * @description Strona na której dodaje się użytkowników
     */
    getAddUser: (req, res, next) => {
        const randomPassword = Math.random().toString(36).substr(2, 10).toUpperCase();
        res.render('users/addUser', { user: req.user, randomPassword});
    },

    /**
     * POST Add user page
     * @description Przetwarza dane z formularza dodawania użytkownika
     */
    postAddUser: (req, res, next) => {
        console.log(req.body);
        const { fName, lName, role, login, email, password, address} = req.body;
        let errors = [];

        if (!fName || !lName || !role || !login || !email || !password) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

        if (password.length < 8) {
            errors.push({ msg: 'Hasło musi składać się z przynajmniej 8 znaków' });
        }

        if(role != 'Admin' && role != 'Kierownik Restauracji' && role != 'Manager'){
            console.log(role != 'Admin' || role != 'Kierownik Restauracji' || role != 'Manager')
            errors.push({ msg: 'Wybierz prawidłową rolę!' });
        }

        if(req.user.role != 'Admin' && role == 'Admin'){
            errors.push({ msg: 'Nie masz uprawnień aby stworzyć użytkownika z tą rolą!' });
            role = 'Manager';
        }

        if(errors.length > 0)
            return res.render('users/addUser', { user: req.user, errors, newUser: req.body});

        Pracownik.findOne({ login: login }).then(user => {
            if (user) {
                errors.push({ msg: 'Użytkownik o takim loginie już istnieje' });
                return res.render('users/addUser', { user: req.user, errors, newUser: req.body});
            }
            const newUser = new Pracownik({fName, lName, address, role, login, password, email});
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;

                    newUser.password = hash;

                    newUser.save().then(user => {
                        req.flash('success_msg', `Prawidłowo dodano użytkownika ${login}`);
                        return res.redirect('/users');
                    }).catch(err => {
                        console.log(err);
                        req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
                        return res.render('users/addUser', { user: req.user, errors, newUser: req.body});
                    });
                });
            });
        });
    }
}