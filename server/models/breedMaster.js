const mongoose = require('mongoose')

const breedMasterSchema = mongoose.Schema({
    breedName: {
        type: String,
        required: true,
    },

    animalType: {
        type: String,
        required: true,
    },

})


module.exports = mongoose.model('BreedMaster', breedMasterSchema)