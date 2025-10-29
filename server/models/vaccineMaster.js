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


module.exports = mongoose.model('VaccineMaster', vaccineMasterSchema)