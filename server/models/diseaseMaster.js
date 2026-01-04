const mongoose = require('mongoose')

const diseaseMasterSchema = new mongoose.Schema({

    animalType: {
        type: String,
        required: true,
    },

    diseaseName: {
        type: String,
        required: true,
    },

})

diseaseMasterSchema.index({ animalType: 1, diseaseName: 1 }, { unique: true });

module.exports = mongoose.model('DiseaseMaster', diseaseMasterSchema)