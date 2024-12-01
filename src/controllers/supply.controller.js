const passport = require('passport');
const moment = require('moment');

const Pracownik = require('../models/Pracownik.js');
const bcrypt = require('bcryptjs');
const Dostawa = require('../models/Dostawa.js');
const PolProdukt = require('../models/PolProdukt.js');
const Dzien = require('../models/Dzien.js');
const Inwentarz = require('../models/Inwentarz.js');

module.exports = {
    /**
     * GET Supply list page
     * @description Wyświetla stronę z listą dostaw
     */
    getSupplyPageDate: async (req, res, next) => {
        const dostawy = await Dostawa.find().populate('polProdukty').sort({name: -1});

        const name = dostawy[0].name;
        res.redirect(`/supply/info/${encodeURIComponent(name)}`);
    },

    /**
     * GET Supply list page
     * @description Wyświetla stronę z listą dostaw
     */
    getSupplyPage: async (req, res, next) => {
        const dostawy = await Dostawa.find().populate('polProdukty').sort({name: -1});
        const dostawa = await Dostawa.findOne({name: req.params.date}).populate('polProdukty');
        let table = [];
        let i = 0;
        for(let polProdukt of dostawa.polProdukty){
            table.push({name: polProdukt.name, unitMain: polProdukt.unitMain, amount: dostawa.pPAmountJG[i]})
            i++;
        }
        console.log(dostawa);
        res.render('supply/index', { user:req.user, dostawa,  dostawy, table});
    },

    /**
     * POST Supply list API
     * @description Przetwarza dane z formularza pre-planowania dostawy
     */
    postSupplyApi: async (req, res, next) => {
        const dni = await Dzien.find({}, {}, {sort: {"name" : -1}}).populate('polProdukty').limit(4);
        const todayDate = moment().format('L');

        const inwentarz = await Inwentarz.findOne({name: todayDate}).populate('polProdukty');

        const { daysAmount, overageAmount } = req.body;
        const supplyDate = moment().add(1, 'days').format('L');


        let skip = true;
        const polProdukty = new Map();
        for(let dzien of dni){
            if(skip){
                skip = false;
                continue;
            }

            let i = 0;
            for(let polProdukt of dzien.polProdukty){
                const _id = polProdukt._id.toString();
                const amount = dzien.usageAmount[i];

                let prevAmount;
                if(polProdukty.has(_id)){
                    prevAmount = polProdukty.get(_id);
                    prevAmount += amount;
                    polProdukty.set(_id, prevAmount);
                }else{
                    polProdukty.set(_id, amount);
                }
                i++;
            }
        }

        let i = 0;
        let table = [];
        for(let polProdukt of inwentarz.polProdukty){

            const _id = polProdukt._id.toString();
            const name = polProdukt.name;
            const unitMain = polProdukt.unitMain;
            const multiplayerSubToMain = polProdukt.multiplayerSubToMain;
            const multiplayerUnitToSub = polProdukt.multiplayerUnitToSub;
            const pPAmountJG = inwentarz.pPAmountJG[i];
            const pPAmountPJ = inwentarz.pPAmountPJ[i];
            const pPAmountJ = inwentarz.pPAmountJ[i];

            const amountInStorage = (pPAmountJG * multiplayerSubToMain * multiplayerUnitToSub) + (pPAmountPJ * multiplayerUnitToSub) + pPAmountJ;

            const mean = polProdukty.get(_id);

            const m = (mean * (overageAmount / 100)) + mean
            const estimatedAmount = amountInStorage - (m * daysAmount);

            if(estimatedAmount <= 0 ){
                let estimatedAmountInJG = Math.ceil(estimatedAmount / (multiplayerSubToMain * multiplayerUnitToSub)) * -1;
                if(estimatedAmountInJG == 0)
                    estimatedAmountInJG = 1;
                table.push({_id, name, estimatedAmount: estimatedAmountInJG, unitMain})
            }else{
                //table.push({_id, name, estimatedAmount: 0, unitMain})
            }

            i++;
        }

        res.send(JSON.stringify({table, supplyDate}));
    },

    /**
     * POST Supply list API
     * @description Przetwarza dane z formularza dostawy
     */
    postSupplyApiEdit: async (req, res, next) => {
        const supplyDate = moment().add(1, 'days').format('L');
        const {daysAmount, overageAmount, table} = req.body;

        let dostawa = new Dostawa({name: supplyDate});
        if (req.user.role == 'Manager')
            dostawa.typZatwierdzenia = 'Manager';
        else
            dostawa.typZatwierdzenia = 'Kierownik Restauracji';


        let i = 0;
        for(let polProdukt of table){
            dostawa.polProdukty.push(polProdukt._id);
            dostawa.pPAmountJG.push(polProdukt.estimatedAmount);
        }

        dostawa = await dostawa.save();

        if (req.user.role == 'Manager')
            dostawa.typZatwierdzenia = 'Manager';
        else
            dostawa.typZatwierdzenia = 'Kierownik Restauracji';


        console.log(table, daysAmount, overageAmount);
        res.send(JSON.stringify({name: dostawa.name}));
    },


    /**
     * POST Supply list page
     * @description Strona na której planuje się odstawy
     */
    getSupplyPagePost: async (req, res, next) => {
        const dostawa = await Dostawa.findOne({name: req.params.date});
        if (req.user.role == 'Manager')
            dostawa.typZatwierdzenia = 'Manager';
        else
            dostawa.typZatwierdzenia = 'Kierownik Restauracji';
        await dostawa.save();
        res.send(JSON.stringify({"Status": "OK"}));
    },
}