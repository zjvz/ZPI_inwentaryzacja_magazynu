const moment = require('moment');

const Sprzedaz = require('../models/Sprzedaz.js');
const Inwentarz = require('../models/Inwentarz.js');
const Dostawa = require('../models/Dostawa.js');
const Straty = require('../models/Straty.js');


module.exports = {
    /**
     * GET index page
     * @description Wyświetla stronę główną w zależności od rangi użytkownika
     */
    getIndex: async (req, res, next) => {
        if(req.user.role == 'Admin' || req.user.role == 'Kierownik Restauracji'){
            const sprzedazTA = await Sprzedaz.find({$or: [{typZatwierdzenia: "Manager"}, {typZatwierdzenia: "Brak"}]}, 'name').sort({name: -1});
            const inwentarzTA = await Inwentarz.find({$or: [{typZatwierdzenia: "Manager"}, {typZatwierdzenia: "Brak"}]}, 'name').sort({name: -1});
            const dostawaTA = await Dostawa.find({$or: [{typZatwierdzenia: "Manager"}, {typZatwierdzenia: "Brak"}]}, 'name').sort({name: -1});
            const stratyTA = await Straty.find({$or: [{typZatwierdzenia: "Manager"}, {typZatwierdzenia: "Brak"}]}, 'name').sort({name: -1});

            res.render('indexes/krIndex', { user: req.user, sprzedazTA, inwentarzTA, dostawaTA, stratyTA});
        }else{
            const sprzedazTA = await Sprzedaz.find({typZatwierdzenia: "Brak"}, 'name').sort({name: -1});
            const inwentarzTA = await Inwentarz.find({typZatwierdzenia: "Brak"}, 'name').sort({name: -1});
            const dostawaTA = await Dostawa.find({typZatwierdzenia: "Brak"}, 'name').sort({name: -1});
            const stratyTA = await Straty.find({typZatwierdzenia: "Brak"}, 'name').sort({name: -1});

            res.render('indexes/managerIndex', { user: req.user, sprzedazTA, inwentarzTA, dostawaTA, stratyTA});
        }
    },
}