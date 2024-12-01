const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const PolProdukt = require('./PolProdukt.js');

const ProduktSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    polProdukty: {
        type: [Schema.Types.ObjectId],
        ref: 'PolProdukt'
    },
    amount: {
        type: [Number],
    },
});
ProduktSchema.plugin(findOrCreate);

const Produkt = mongoose.model('Produkt', ProduktSchema);

module.exports = Produkt;