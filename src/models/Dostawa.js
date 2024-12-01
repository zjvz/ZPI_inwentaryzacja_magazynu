const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const DostawaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    polProdukty: {
        type: [Schema.Types.ObjectId],
        ref: 'PolProdukt'
    },
    pPAmountJG:{
        type: [Number],
    },
    typZatwierdzenia: {
        type: String,
        default: "Brak"
    }
});
DostawaSchema.plugin(findOrCreate);

const Dostawa = mongoose.model('Dostawa', DostawaSchema);

module.exports = Dostawa;