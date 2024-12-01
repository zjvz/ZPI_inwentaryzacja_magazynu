const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const SprzedazSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    comment: {
        type: String,
        default: "brak"
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
SprzedazSchema.plugin(findOrCreate);

const Sprzedaz = mongoose.model('Sprzedaz', SprzedazSchema);

module.exports = Sprzedaz;