const mongoose = require('mongoose')

const breedMasterSchema = new mongoose.Schema({
    breedName: {
        type: String,
        required: true,
    },

    animalType: {
        type: String,
        required: true,
    },

})

breedMasterSchema.index({ animalType: 1, breedName: 1 }, { unique: true });


module.exports = mongoose.model('BreedMaster', breedMasterSchema)