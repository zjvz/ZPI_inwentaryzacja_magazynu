const passport = require('passport');
const moment = require('moment'); // require
const Dzien = require('../models/Dzien.js');
const Straty = require('../models/Straty.js');
const Produkt = require('../models/Produkt.js');
const PolProdukt = require('../models/PolProdukt.js');
const Sprzedaz = require('../models/Sprzedaz.js');
const Inwentarz = require('../models/Inwentarz.js');

module.exports = {
    /**
     * GET INV page
     * @description Wyświetla stronę z ogólną listą danych inwentaryzacji
     */
    getAddInvDatePage: async (req, res, next) => {
        const todayDate = moment().format('L');
        res.redirect(`/storages/inv/add/${encodeURIComponent(todayDate)}`)
        //res.render('inv/add', { user: req.user, dni});
    },

    /**
     * GET INV page
     * @description Wyświetla stronę z ogólną listą danych inwentaryzacji
     */
    getAddInvPage: async (req, res, next) => {
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

        let inwentarz = await Inwentarz.findOne({name: dzien.name});
        if(!inwentarz){
            inwentarz = new Inwentarz({name: dzien.name});
            const polprodukty = await PolProdukt.find();
            for(let polprodukt of polprodukty){
                inwentarz.polProdukty.push(polprodukt._id);
                inwentarz.pPAmountJG.push(0);
                inwentarz.pPAmountPJ.push(0);
                inwentarz.pPAmountJ.push(0);
            }

            if (req.user.role == 'Manager')
                inwentarz.typZatwierdzenia = 'Manager';
            else
                inwentarz.typZatwierdzenia = 'Kierownik Restauracji';

            inwentarz = await inwentarz.save();
        }

        dzien.inwentarz = inwentarz._id;
        dzien.save();

        inwentarz = await inwentarz.populate('polProdukty');

        res.render('storages/addStatus', { user: req.user, date: dzien, dni, inv: inwentarz});
    },


    /**
     * POST INV API
     * @description Przetwarza dane z formularza wprowadzania danych inwentaryzacji
     */
    postAddInv: async (req, res, next) => {
        const {dateData, polProdukty, pPAmountJG, pPAmountPJ, pPAmountJ} = req.body;
        let inwentarz = await Inwentarz.findOne({name: dateData});
        inwentarz.polProdukty = polProdukty;
        inwentarz.pPAmountJG = pPAmountJG;
        inwentarz.pPAmountPJ = pPAmountPJ;
        inwentarz.pPAmountJ = pPAmountJ;

        if (req.user.role == 'Manager')
            inwentarz.typZatwierdzenia = 'Manager';
        else
            inwentarz.typZatwierdzenia = 'Kierownik Restauracji';

        inwentarz = await inwentarz.save();
        console.log(inwentarz);

        req.flash('success_msg', `Prawidłowo zaktualizowano dane inwentaryzacji`);
        res.redirect(`/storages/inv/add/${encodeURIComponent(dateData)}`)
    },

}