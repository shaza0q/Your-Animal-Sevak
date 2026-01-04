// models/farm.js
const mongoose = require('mongoose')

const FarmSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newUser',
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "newUser",
    required: true,
  },

  name: {
    type: String,
    required: true
  },

  animalTypes: {
    type: [String],
    default: []
  },

  location: {
    type: String,
  },
  
  capacity: {
    type: Number,
  },

  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active",
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
