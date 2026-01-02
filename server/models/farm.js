const mongoose = require('mongoose')

const FarmSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'newUser',
        required: true,
    },

    name: {
        type: String,
        required: true
    },

    animalTypes: {
        type: [String],  // <-- array of strings
        default: []
    },

    location: {
        type: String,
    },
    
    capacity: {
        type: Number,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Farm", FarmSchema)