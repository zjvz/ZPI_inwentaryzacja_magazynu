const mongoose = require('mongoose');
const findOrCreate = require('mongoose-find-or-create');

const MagazynSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
    },
    shortcut: {
        type: String,
        required: true,
        unique: true
    },
});
MagazynSchema.plugin(findOrCreate);

const Magazyn = mongoose.model('Magazyn', MagazynSchema);

module.exports = Magazyn;