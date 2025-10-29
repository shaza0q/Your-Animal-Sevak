const mongoose = require('mongoose')

const diseaseMasterSchema = mongoose.Schema({

    animalType: {
        type: String,
        required: true,
    },

    diseaseName: {
        type: String,
        required: true,
    },

})


module.exports = mongoose.model('DiseaseMaster', diseaseMasterSchema)