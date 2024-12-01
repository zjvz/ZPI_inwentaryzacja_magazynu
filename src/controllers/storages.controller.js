const passport = require('passport');
const Magazyn = require('../models/Magazyn.js');

module.exports = {
    /**
     * GET storages page
     * @description Wyświetla stronę z listą magazynów
     */
    getStoragesPage: (req, res, next) => {
        Magazyn.find({}, (err, data) => {
            if(data)
                res.render('storages/index', { user: req.user, data });  
        })
    },

    
    /**
     * GET Add Storage page
     * @description Wyświetla stronę z formularzem dodawania magazynów
     */
    getAddStoragePage: (req, res, next) => {
        res.render('storages/add', { user: req.user});
    },

    /**
     * POST Add Storage page
     * @description Przetwarza dane z formularza dodawania magazynów
     */
    postAddStorage: (req, res, next) => {
        const { name, location, shortcut} = req.body;
        let errors = [];

        if (!name || !location || !shortcut) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

        if(errors.length > 0)
            return res.render('storages/add', { user: req.user, errors, newMagazyn: req.body});

        Magazyn.findOne({$or:[{ name }, { shortcut }]}).then(magazyn => {
            if (magazyn) {
                errors.push({ msg: 'Nazwa oraz skrót magazyny muszą być unikalne!' });
                return res.render('storages/add', { user: req.user, errors, newMagazyn: req.body});
            }
            const newMagazyn = new Magazyn({name, location, shortcut});
            newMagazyn.save().then(magazyn => {
                req.flash('success_msg', `Prawidłowo dodano magazyn ${name}`);
                return res.redirect('/storages');
            }).catch(err => {
                console.log(err);
                req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
                return res.render('storages/add', { user: req.user, errors, newMagazyn: req.body});
            });
        }); 
        //res.redirect('/storages');
    },

    /**
     * POST Edit Storage API
     * @description Przetwarza dane z formularza edytowania magazynów
     */
    postEditStorage: async (req, res, next) => {
        const { prevName, type, name, location, shortcut} = req.body;
        if(type == 'edit'){
            if (!prevName || !name || !location || !shortcut) {
                req.flash('error', 'Edytując magazyn uzupełnij wszystkie pola!');
                return res.redirect('/storages');
            }

            const magazyn = await Magazyn.findOneAndUpdate({name: prevName}, {name, location, shortcut}, {new: true});
            if(magazyn){
                req.flash('success_msg', `Prawidłowo zaktualizowano magazyn ${prevName}`);
            }else{
                req.flash('error', 'Błąd podczas edytowania magazynu!');
            }
            return res.redirect('/storages');
        }

        if(type == 'remove'){
            if (!prevName) {
                req.flash('error', 'Błąd podczas usuwania magazynu!');
                return res.redirect('/storages');
            }

            Magazyn.findOneAndRemove({name: prevName}, (err, magazyn) => {
                if(magazyn){
                    req.flash('success_msg', `Prawidłowo usunięto magazyn ${magazyn.name}`);
                }else{
                    req.flash('error', 'Błąd podczas usuwania magazynu!');
                }
                return res.redirect('/storages');
            });


        }
        //res.send(JSON.stringify(req.body));
        //res.redirect('/storages');
    },
}