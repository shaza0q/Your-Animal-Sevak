const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({
    animalId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Animal',
    },
    
    date: {
        type: Date,
        default: Date.now,
    },

    vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VaccineMaster',
    },

    notes: {
        type: String,
        required: true,
    },

    nextDueDate: { type: Date },
    
    staffId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'newUser',
        required: true,
    },
}, { timestamps: true })


vaccinationSchema.index({animalId: 1, nextDueDate: 1, vaccine: 1})


module.exports = mongoose.model('Vaccination', vaccinationSchema)