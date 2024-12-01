const passport = require('passport');
const moment = require('moment'); // require
const Dzien = require('../models/Dzien.js');
const Straty = require('../models/Straty.js');
const Produkt = require('../models/Produkt.js');
const PolProdukt = require('../models/PolProdukt.js');
const Sprzedaz = require('../models/Sprzedaz.js');

module.exports = {
    /**
     * GET sale page
     * @description Wyświetla stronę z ogólną listą sprzedaży
     */
    getAddSaleDatePage: async (req, res, next) => {
        const todayDate = moment().format('L');
        res.redirect(`/sale/add/${encodeURIComponent(todayDate)}`)
        //res.render('sale/add', { user: req.user, dni});
    },

    /**
     * GET sale page
     * @description Wyświetla stronę z ogólną listą sprzedaży
     */
    getAddSalePage: async (req, res, next) => {
        //res.send(JSON.stringify(req.params));
        const todayDate = moment().format('L');
        const reqDate = req.params.date;
        let dzien = await Dzien.findOne({name: todayDate});
        if(!dzien){
            dzien = await new Dzien({name: todayDate}).save();
        }

        if(dzien.name != reqDate){
            dzien = await Dzien.findOne({name: reqDate});
        }

        const dni = await Dzien.find();

        let sprzedaz = await Sprzedaz.findOne({name: dzien.name});
        if(!sprzedaz){
            sprzedaz = new Sprzedaz({name: dzien.name});
            const produkty = await Produkt.find();
            for(let produkt of produkty){
                sprzedaz.Produkty.push(produkt._id);
                sprzedaz.ProduktyAmount.push(0);
            }

            if (req.user.role == 'Manager') 
                sprzedaz.typZatwierdzenia = 'Manager';
            else
                sprzedaz.typZatwierdzenia = 'Kierownik Restauracji';
                
            sprzedaz = await sprzedaz.save();
        }


        dzien.sprzedaz = sprzedaz._id;
        dzien.save();

        sprzedaz = await sprzedaz.populate('Produkty');
        console.log(sprzedaz); 
        res.render('sale/add', { user: req.user, date: dzien, dni, sale: sprzedaz});
    },

    
    /**
     * POST sale API
     * @description Przetwarza dane z formularza wprowadzania sprzedazy
     */
    postAddSale: async (req, res, next) => {
        //console.log(req.body);
        const {dateData, Produkty, ProduktyAmount} = req.body;
        let sprzedaz = await Sprzedaz.findOne({name: dateData});
        sprzedaz.Produkty = Produkty;
        sprzedaz.ProduktyAmount = ProduktyAmount;

        if (req.user.role == 'Manager') 
            sprzedaz.typZatwierdzenia = 'Manager';
        else
            sprzedaz.typZatwierdzenia = 'Kierownik Restauracji';

        sprzedaz = await sprzedaz.save();
        //console.log(sprzedaz);

        req.flash('success_msg', `Prawidłowo zaktualizowano dane sprzedaży`);
        res.redirect(`/sale/add/${encodeURIComponent(dateData)}`)
    },

}