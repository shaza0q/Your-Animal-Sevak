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

    staff: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'newUser',
        },
        role: {
            type: String,
            enum: ['staff', 'caretaker'],
        },
        joinedAt: Date,
        }],

        veterinarians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'newUser',
    }],


})

module.exports = mongoose.model("Farm", FarmSchema)