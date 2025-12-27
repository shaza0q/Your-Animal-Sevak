const mongoose = require('mongoose')

const vaccineMasterSchema = mongoose.Schema({
    vaccineName: {
        type: String,
        required: true,
    },

    animalType: {
        type: String,
        required: true,
    },

})

vaccineMasterSchema.index({ animalType: 1, vaccineName: 1 }, { unique: true });

module.exports = mongoose.model('VaccineMaster', vaccineMasterSchema)