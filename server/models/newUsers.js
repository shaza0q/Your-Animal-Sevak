const mongoose = require('mongoose');

const newUserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,   
    },
    mobile:{
        type: Number,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['admin', 'staff', 'caretaker', 'veterinarian'],
        default: 'caretaker',
    },
    isActive: {
        type: Boolean,
        default: true,
    }

})


module.exports = mongoose.model('newUser', newUserSchema)