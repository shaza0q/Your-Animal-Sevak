const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema({
  tagNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },

  name: { type: String, required: true },

  farmId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farm' 
  },

  type: { 
    type: String, 
    enum: ["Cow", "Goat", "Sheep", "Pig", "Chicken", "Other"], 
    required: true 
  },

  breed: { type: String, required: true },
  
  gender: { 
    type: String, 
    enum: ["Male", "Female"], 
    required: true 
  },

  generation: { type: String },

  weight: { type: Number },

  colorMarkings: { type: String },

  dateOfBirth: { type: Date },

  acquisitionDate: { type: Date },

  status: {
    type: String,
    required: true,
    enum: ['Active', 'Sold', 'Deceased'],
    default: 'Active',
  },
  
  location: { type: String },

  feedType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FeedMaster' 
  },

}, { timestamps: true });


animalSchema.index({tagNumber: 1}, {uniique: true});
animalSchema.index({type: 1})
animalSchema.index({feedType: 1})
animalSchema.index({farmId: 1})
animalSchema.index({status: 1})
animalSchema.index({dateOfBirth: 1})


module.exports = mongoose.model("Animal", animalSchema);
