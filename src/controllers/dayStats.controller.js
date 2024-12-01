const passport = require('passport');
const moment = require('moment'); // require
const Dzien = require('../models/Dzien.js');
const Straty = require('../models/Straty.js');
const Produkt = require('../models/Produkt.js');
const PolProdukt = require('../models/PolProdukt.js');
const Sprzedaz = require('../models/Sprzedaz.js');
const Inwentarz = require('../models/Inwentarz.js');
const Dostawa = require('../models/Dostawa.js');

module.exports = {
    /**
     * GET sale page
     * @description Wyświetla stronę z ogólną listą sprzedaży
     */
    getStatsDatePage: async (req, res, next) => {
        const todayDate = moment().subtract(1, 'days').format('L');

        res.redirect(`/data/info/${encodeURIComponent(todayDate)}`)
    },

    /**
     * GET sale page
     * @description Wyświetla stronę z ogólną listą sprzedaży
     */
    getStatsPage: async (req, res, next) => {
        const todayDate = moment().subtract(1, 'days').format('L');
        const reqDate = req.params.date;
        
        let dzien = await Dzien.findOne({name: reqDate});

        const dni = await Dzien.find().skip(1);
        
        dzien = await dzien.populate('straty');
        dzien = await dzien.populate('sprzedaz');
        dzien = await dzien.populate('inwentarz');

        const nextDateName = moment(dzien.name).add(1, 'days').format('L'); 
        const nextDateInv = await Inwentarz.findOne({name: nextDateName});

        const produkty = await Produkt.find().populate('polProdukty');
        const polprodukty = await PolProdukt.find().populate('magazyn');

        const dostawa = await Dostawa.findOne({name: nextDateName}).populate('polProdukty');

        let tableData = [];

        const _date = dzien;
        const _nextdate = nextDateInv;
        const _produkty = produkty;
        const _polprodukty = polprodukty;

        const editDay = (dzien.usageAmount.length == 0)

        for(let _polProdukt of _polprodukty){
            const _id = _polProdukt._id;
            const name = _polProdukt.name;
            const unitMain = _polProdukt.unitMain
            const unitSub = _polProdukt.unitSub;
            const unit = _polProdukt.unit;

            const multiplayerSubToMain = _polProdukt.multiplayerSubToMain;
            const multiplayerUnitToSub = _polProdukt.multiplayerUnitToSub;

            

            const i = _date.inwentarz.polProdukty.findIndex((ele) => ele.toString() == _id);
            
            if(i == -1)
                continue;
            const amountUM = _date.inwentarz.pPAmountJG[i];
            const amountUS = _date.inwentarz.pPAmountPJ[i];
            const amountU = _date.inwentarz.pPAmountJ[i];

            const stanPoczatkowyWMagazynie  = ((amountUM * multiplayerSubToMain) * multiplayerUnitToSub) + (amountUS * multiplayerUnitToSub) + amountU;

            const iloscSprzedazy = sprzedazPolProduktu(_id, _produkty, _date);
            const iloscStrat = stratyPolProduktu(_id, multiplayerSubToMain, multiplayerUnitToSub, _produkty, _date);

            const sugerowanyStanKoncowy = stanPoczatkowyWMagazynie - (iloscSprzedazy + iloscStrat);
           
            const sugerownyStanUM = Math.floor(sugerowanyStanKoncowy / (multiplayerSubToMain * multiplayerUnitToSub));
            const sugerownyStanUS =  Math.floor((sugerowanyStanKoncowy - (sugerownyStanUM * multiplayerSubToMain * multiplayerUnitToSub)) / multiplayerUnitToSub);
            const sugerownyStanU = sugerowanyStanKoncowy - ((sugerownyStanUM * multiplayerSubToMain * multiplayerUnitToSub) + (sugerownyStanUS * multiplayerUnitToSub));    

            
            let iloscDostawy = 0;

            if(dostawa){
                const j = dostawa.polProdukty.findIndex((ele) => {
                    console.log(ele.toString(), ele._id.toString() == _id.toString(), _id.toString());
                    return ele._id.toString() == _id.toString()
                });
                
                if(j != -1)
                    iloscDostawy = dostawa.pPAmountJG[j];
            }
            
            

            const faktycznyStanUM = _nextdate.pPAmountJG[i] - iloscDostawy;
            const faktycznyStanUS = _nextdate.pPAmountPJ[i];
            const faktycznyStanU = _nextdate.pPAmountJ[i];

            const faktycznyStanWMagazynie  = ((faktycznyStanUM * multiplayerSubToMain) * multiplayerUnitToSub) + (faktycznyStanUS * multiplayerUnitToSub) + faktycznyStanU;

            let roznicaStanu = faktycznyStanWMagazynie - sugerowanyStanKoncowy;
            if(roznicaStanu > 0 )
                roznicaStanu = "+" + roznicaStanu;
            
            const newEle = { _id, name, iloscSprzedazy, iloscStrat, unitMain, multiplayerSubToMain, sugerownyStanUM, faktycznyStanUM, iloscDostawy, unitSub, multiplayerUnitToSub, sugerownyStanUS, faktycznyStanUS, unit, sugerownyStanU, faktycznyStanU, stanPoczatkowyWMagazynie, faktycznyStanWMagazynie, roznicaStanu};
            //console.log(`${name}: \n\tSugerowany stan koncowy JednostkiGłównej: ${sugerownyStanUM}\n\tSugerowany stan koncowy PodJednostki: ${sugerownyStanUS}\n\tSugerowany stan koncowy Jednostki: ${sugerownyStanU}`);
        
            tableData.push(newEle);

            if(editDay){
                dzien.polProdukty.push(_id);
                dzien.usageAmount.push(iloscSprzedazy + iloscStrat);
            }
        }

        

        dzien.save();   
       
        
        res.render('data/index', { user: req.user, date: dzien, dni, produkty, polprodukty, nextDateInv, tableData});
    },
}

const sprzedazPolProduktu = (_id, _produkty, _date) => {
    let suma = 0;
    for(let produkt of _produkty){
        const i = produkt.polProdukty.findIndex((ele) => ele._id.toString() == _id.toString());
        if(i == -1)
            continue;
        
        const amountInProduct = produkt.amount[i];
        const j = _date.sprzedaz.Produkty.findIndex((ele) => ele.toString() == produkt._id.toString());

        if(j == -1 || isNaN(j))
            continue;
        const iloscProduktow = _date.sprzedaz.ProduktyAmount[j];
        const sumaCzesciowa = amountInProduct * iloscProduktow;
        
        suma += sumaCzesciowa;
        
    }
    return suma;
}

const stratyPolProduktu = (_id, multiplayerSubToMain, multiplayerUnitToSub, _produkty, _date) => {
    let suma = 0;
    for(let _produkt of _produkty){
        const i = _produkt.polProdukty.findIndex((ele) => ele._id.toString() == _id.toString());
        
        if(i == -1)
            continue;
        const amountInProduct = _produkt.amount[i];

        const j = _date.straty.Produkty.findIndex((ele) => ele.toString() == _produkt._id.toString());
        if(j == -1 || isNaN(j))
            continue;
        const productWastage = _date.straty.ProduktyAmount[j];
        const sumaCzesciowa = amountInProduct * productWastage;

        suma += sumaCzesciowa;
    }

    
    const i = _date.straty.polProdukty.findIndex((ele) =>  ele.toString() == _id.toString());
    const amountU = _date.straty.pPAmountJ[i];
    const amountUS = _date.straty.pPAmountJG[i];
    const amountUM = _date.straty.pPAmountPJ[i];

    suma += (((amountUM * multiplayerSubToMain) * multiplayerUnitToSub) + (amountUS * multiplayerUnitToSub) + amountU);
    
    return suma;
}