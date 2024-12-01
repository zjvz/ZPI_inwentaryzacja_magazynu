const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const InwentarzSchema = new mongoose.Schema({
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
    typZatwierdzenia: {
        type: String,
        default: "Brak"
    }
});
InwentarzSchema.plugin(findOrCreate);

const Inwentarz = mongoose.model('Inwentarz', InwentarzSchema);

module.exports = Inwentarz;