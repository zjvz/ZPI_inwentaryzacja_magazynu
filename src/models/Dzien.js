const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const DzienSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    comment: {
        type: String,
        default: "brak"
    },
    straty: {
        type: Schema.Types.ObjectId,
        ref: 'Straty'
    },
    sprzedaz: {
        type: Schema.Types.ObjectId,
        ref: 'Sprzedaz'
    },
    inwentarz: {
        type: Schema.Types.ObjectId,
        ref: 'Inwentarz'
    },
    typZatwierdzenia: {
        type: String,
        default: "Brak"
    },
    polProdukty: {
        type: [Schema.Types.ObjectId],
        ref: 'PolProdukt',
        default: []
    },
    usageAmount: {
        type: [Number],
        default: []
    },
});
DzienSchema.plugin(findOrCreate);

const Dzien = mongoose.model('Dzien', DzienSchema);

module.exports = Dzien;