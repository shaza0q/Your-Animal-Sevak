const mongoose = require('mongoose')

const FarmSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    animalTypes: {
        type: [String],  // <-- array of strings
        enum: ["Cow", "Goat", "Horse", "Dog", "Sheep", "Chicken"], // restrict to valid choices
        default: []
    },

    location: {
        type: String,
    },
    
    capacity: {
        type: Number,
    }

})

module.exports = mongoose.model("Farm", FarmSchema)