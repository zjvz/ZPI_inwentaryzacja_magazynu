const passport = require('passport');
const Magazyn = require('../models/Magazyn.js');
const PolProdukt = require('../models/PolProdukt.js');
const Produkt = require('../models/Produkt.js');

const refreshProducts = async (SPProduct_id) => {
    const produkty = await Produkt.find();
    for(let produkt of produkty){
        let i = 0, toSave = false;
        console.log('PreEdit:', produkt);
        for(let polProdukt of produkt.polProdukty){
            console.log(polProdukt, produkt.polProdukty[i]._id, SPProduct_id, produkt.polProdukty[i]._id == SPProduct_id);
            if(produkt.polProdukty[i]._id.toString() == SPProduct_id.toString()){
                delete produkt.polProdukty[i];
                delete produkt.amount[i];
                toSave = true;
                break;
            }
            i++;
        }
        if(toSave){
            console.log("PostEdit:", produkt);
            produkt.save();
        }
    }
}

module.exports = {
    /**
     * GET SPProducts page
     * @description Wyświetla stronę z listą półproduktów
     */
    getProductsPage: async (req, res, next) => {
        const magazyny = await Magazyn.find();
        res.render('spproducts/index', { user: req.user, storages: magazyny});
    },

    /**
     * GET SPProducts API
     * @description Zwraca listę pół-produktów
     */
    getProductsAPI: async (req, res, next) => {
        const polProdukty = await PolProdukt.find().populate('magazyn');
        res.send(JSON.stringify(polProdukty));
        //res.render('spproducts/index', { user: req.user});
    },


    /**
     * GET Add SPProduct page
     * @description Wyświetla stronę z formularzem dodawania półproduktów
     */
    getAddProductPage: async (req, res, next) => {
        const magazyny = await Magazyn.find();
        let nazwyMagazynow = [];
        for(let magazyn of magazyny){
            nazwyMagazynow.push({name: magazyn.name, shortcut: magazyn.shortcut});
        }
        res.render('spproducts/add', { user: req.user, storages: nazwyMagazynow});
    },

    /**
     * POST Add SPProduct page
     * @description Przetwarza dane z formularza dodawania półproduktów
     */
    postAddProduct: async (req, res, next) => {
        const { name, storage, unitMain, unitSub, unit, multiplayerSubToMain, multiplayerUnitToSub} = req.body;
        let errors = [];

        if (!name || !storage || !unitMain || !unitSub || !unit || !multiplayerSubToMain || !multiplayerUnitToSub) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

        if(errors.length > 0)
            return res.render('spproducts/add', { user: req.user, errors, newPolProdukt: req.body});

        const polProdukt = await PolProdukt.findOne({name});
        if (polProdukt) {
            errors.push({ msg: 'Produkt o takiej nazwie już istnieje!' });
            return res.render('spproducts/add', { user: req.user, errors, newPolProdukt: req.body});
        }

        let newPolProdukt = new PolProdukt({ name, unitMain, unitSub, unit, multiplayerSubToMain, multiplayerUnitToSub});
        newPolProdukt = await newPolProdukt.changeMagazyn(storage);
        if(!newPolProdukt){
            errors.push({ msg: 'Podano nieprawidłowy magazyn!' });
            return res.render('spproducts/add', { user: req.user, errors, newPolProdukt: req.body});
        }

        newPolProdukt.save().then(_newPolProdukt => {
            req.flash('success_msg', `Prawidłowo dodano Pół-Produkt ${name}`);
            return res.redirect('/spproducts');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
            return res.render('spproducts/add', { user: req.user, errors, newPolProdukt: req.body});
        });
        //res.send(JSON.stringify(req.body));
        //res.redirect('/spproducts');
    },

    /**
     * POST Edit SPProduct API
     * @description Przetwarza dane z formularza edytowania pół-produktu
     */
    postEditProduct: async (req, res, next) => {
        //res.send(JSON.stringify(req.body));
        const { prevName, name, storage, unitMain, unitSub, unit, multiplayerSubToMain, multiplayerUnitToSub, type} = req.body;
        if(type == 'edit'){
            if (!prevName || !name || !storage || !unitMain || !unitSub || !unit || !multiplayerSubToMain || !multiplayerUnitToSub) {
                req.flash('error', 'Edytując pół-produkt uzupełnij wszystkie pola!');
                return res.redirect('/spproducts');
            }

            const magazyn = await Magazyn.findOne({shortcut: storage});
            if(!magazyn){
                req.flash('error', 'Błąd, nieprawidłowa nazwa magazynu!');
                return res.redirect('/spproducts');
            }

            const polProdukt = await PolProdukt.findOne({name: prevName});
            if(!polProdukt){
                req.flash('error', 'Błąd podczas edytowania pół-produktu!');
                return res.redirect('/spproducts');
            }

            polProdukt.name = name;
            polProdukt.unitMain = unitMain;
            polProdukt.unitSub = unitSub;
            polProdukt.unit = unit;
            polProdukt.multiplayerSubToMain = multiplayerSubToMain;
            polProdukt.multiplayerUnitToSub = multiplayerUnitToSub;
            polProdukt.magazyn = magazyn._id;

            polProdukt.save().then(_newPolProdukt => {
                req.flash('success_msg', `Prawidłowo zaktualizowano Pół-Produkt ${prevName}`);
                return res.redirect('/spproducts');
            }).catch(err => {
                console.log(err);
                req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
                return res.redirect('/spproducts');
            });
        }

        if(type == 'remove'){
            if (!prevName) {
                req.flash('error', 'Błąd podczas usuwania poł-produktu!');
                return res.redirect('/spproducts');
            }

            PolProdukt.findOneAndRemove({name: prevName}, (err, polProdukt) => {
                if(polProdukt){
                    refreshProducts(polProdukt._id);
                    req.flash('success_msg', `Prawidłowo usunięto pół-produkt ${polProdukt.name}`);
                }else{
                    req.flash('error', 'Błąd podczas usuwania poł-produktu!');
                }
                return res.redirect('/spproducts');
            });


        }
        //
        //res.redirect('/storages');
    },
}