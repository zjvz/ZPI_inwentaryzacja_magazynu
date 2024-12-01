const mongoose = require('mongoose');
const { Schema } = mongoose;
const findOrCreate = require('mongoose-find-or-create');
const Magazyn = require('../models/Magazyn.js');


const PolProduktSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    unitMain: {
        type: String,
        required: true,
    },
    unitSub: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    multiplayerSubToMain: {
        type: Number,
    },
    multiplayerUnitToSub: {
        type: Number,
    },
    magazyn: {
        type: Schema.Types.ObjectId,
        ref: 'Magazyn'
    }
});
PolProduktSchema.plugin(findOrCreate);

PolProduktSchema.methods.changeMagazyn = async function(shortcut) {
    console.log(this);
    try{
        const magazyn = await Magazyn.findOne({shortcut});
        if(magazyn){
            this.magazyn = magazyn._id;
            return this;
        }
    }catch(err){
        console.log(err)
        return false;
    }
    return false;
}

const PolProdukt = mongoose.model('PolProdukt', PolProduktSchema);

module.exports = PolProdukt;