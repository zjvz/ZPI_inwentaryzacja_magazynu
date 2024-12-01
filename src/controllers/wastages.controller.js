const passport = require('passport');
const moment = require('moment'); // require
const Dzien = require('../models/Dzien.js');
const Straty = require('../models/Straty.js');
const Produkt = require('../models/Produkt.js');
const PolProdukt = require('../models/PolProdukt.js');

module.exports = {

    /**
     * GET Wastages page
     * @description Wyświetla stronę z ogólną listą strat
     */
    getAddWastagesDatePage: async (req, res, next) => {
        const todayDate = moment().format('L');
        res.redirect(`/data/add/${encodeURIComponent(todayDate)}`)
        //res.render('wastages/add', { user: req.user, dni});
    },

    /**
     * GET Wastages page
     * @description Wyświetla stronę z ogólną listą strat
     */
    getAddWastagesPage: async (req, res, next) => {
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

        let straty = await Straty.findOne({name: dzien.name});
        if(!straty){
            straty = new Straty({name: dzien.name});
            const produkty = await Produkt.find();
            for(let produkt of produkty){
                straty.Produkty.push(produkt._id);
                straty.ProduktyAmount.push(0);
            }
            const polprodukty = await PolProdukt.find();
            for(let polprodukt of polprodukty){
                straty.polProdukty.push(polprodukt._id);
                straty.pPAmountJG.push(0);
                straty.pPAmountPJ.push(0);
                straty.pPAmountJ.push(0);
            }
            //console.log(straty); 
            if (req.user.role == 'Manager') 
                straty.typZatwierdzenia = 'Manager';
            else
                straty.typZatwierdzenia = 'Kierownik Restauracji';
            straty = await straty.save();
        }

        dzien.straty = straty._id;
        dzien.save();

        straty = await (await straty.populate('Produkty')).populate('polProdukty');
        console.log(straty); 
        res.render('wastages/add', { user: req.user, date: dzien, dni, straty});
        
    },

    
    /**
     * POST Wastages API
     * @description Przetwarza dane z formularza wprowadzania strat
     */
    postAddWastages: async (req, res, next) => {
        const {dateData, Produkty, ProduktyAmount, polProdukty, pPAmountJG, pPAmountPJ, pPAmountJ} = req.body;
        let straty = await Straty.findOne({name: dateData});
        straty.Produkty = Produkty;
        straty.ProduktyAmount = ProduktyAmount;
        straty.polProdukty = polProdukty;
        straty.pPAmountJG = pPAmountJG;
        straty.pPAmountPJ = pPAmountPJ;
        straty.pPAmountJ = pPAmountJ;

        if (req.user.role == 'Manager') 
            straty.typZatwierdzenia = 'Manager';
        else
            straty.typZatwierdzenia = 'Kierownik Restauracji';

        straty = await straty.save();
        console.log(straty);

        req.flash('success_msg', `Prawidłowo zaktualizowano dane strat`);
        res.redirect(`/data/add/${encodeURIComponent(dateData)}`)
    },

}