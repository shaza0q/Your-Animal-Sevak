const mongoose = require("mongoose");
const animal = require("./animal");

const animalUpdateSchema = new mongoose.Schema({
    animalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Animal",
    },
    
    date: {
        type: Date,
        default: Date.now,
    },

    notes: { type: String },

    mediaUrl: { type: String },

    staffId: { 
        type: ObjectId, 
        ref: 'newUser',
        required: true,
    },

    status: {
        type: String,
        enum: ['Healthy', "Injured", "Diseased"],
        default: "Healthy"
    },

}, { timestamps: true })


animalUpdateSchema.index({animalId: 1, status: 1})

module.exports = mongoose.model('AnimalUpdate', animalUpdateSchema)