const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const StratySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    comment: {
        type: String,
        default: "brak"
    },
    polProdukty: {
        type: [Schema.Types.ObjectId],
        ref: 'PolProdukt'
    },
    pPAmountJG:{
        type: [Number],
    },
    pPAmountPJ:{
        type: [Number],
    },
    pPAmountJ:{
        type: [Number],
    },
    Produkty: {
        type: [Schema.Types.ObjectId],
        ref: 'Produkt'
    },
    ProduktyAmount: {
        type: [Number],
    },
    typZatwierdzenia: {
        type: String,
        default: "Brak"
    }
});
StratySchema.plugin(findOrCreate);

const Straty = mongoose.model('Straty', StratySchema);

module.exports = Straty;