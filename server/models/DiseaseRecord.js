const mongoose = require("mongoose");

const diseaseRecordSchema = new mongoose.Schema({
    animalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal',
        required: true,
    },
    
    diseaseName: { type: String },

    date: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        required: true,
        enum: ['Diagnosis', 'Treatment', 'Observation', 'Checkup', 'Healthy', 'Fatal'],
    },

    notes: {
        type: String,
        required: true,
    },
    
    staffId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'newUser',
        required: true,
    },
}, { timestamps: true })


diseaseRecordSchema.index({animalId: 1, diseaseName: 1, status: 1, date: 1})

module.exports = mongoose.model('Disease', diseaseRecordSchema)