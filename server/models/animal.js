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

  animalType: { 
    type: String, 
    enum: [
    "Cow",
    "Buffalo",
    "Goat",
    "Sheep",
    "Chicken",
    "Duck",
    "Rabbit",
    "Dog",
    "Cat",
    "Camel",
    "Donkey",
    "Horse",
    "Pigeon",
    "Turkey",
    "other"
  ], 
    required: true 
  },

  breed: { type: String, required: true },
  
  gender: { 
    type: String, 
    enum: ["Male", "Female"], 
    required: true 
  },

  motherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', default: undefined },
  
  fatherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', default: undefined },

  generation: { type: Number, default: 1 },

  weight: { type: Number },

  dateOfBirth: { type: Date },

  acquisitionDate: { type: Date },

  status: {
    type: String,
    required: true,
    enum: ['Active', 'Sold', 'Deceased'],
    default: 'Active',
  },

  caretakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newUser'
  }],

}, { timestamps: true });


animalSchema.index({tagNumber: 1}, {unique: true});
animalSchema.index({type: 1})
animalSchema.index({feedType: 1})
animalSchema.index({farmId: 1})
animalSchema.index({status: 1})
animalSchema.index({dateOfBirth: 1})


module.exports = mongoose.model("Animal", animalSchema);