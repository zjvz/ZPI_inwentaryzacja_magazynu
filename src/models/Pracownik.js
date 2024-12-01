const mongoose = require('mongoose');
const findOrCreate = require('mongoose-find-or-create')

const PracownikSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['Manager', 'Kierownik Restauracji', 'Admin'],
        default: 'Manager',
        required: true
    },
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false
    },
    passwordToReset:{
        type: Boolean,
        default: true,
        required: false
    },
});
PracownikSchema.plugin(findOrCreate);

const Pracownik = mongoose.model('Pracownik', PracownikSchema);

module.exports = Pracownik;