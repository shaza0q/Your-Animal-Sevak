const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  animalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Animal", 
    required: true 
  },

  price: { type: Number },

  dateSold: { type: Date },

  buyerName: { type: String, required: true },

  buyerContactInfo: { type: Number, required: true  },

  buyerAddress: { type: String },

  buyerEmail: { type: String },

  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newUser'
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },


}, { timestamps: true });


salesSchema.index({
  date: -1,
  animalId: 1
})

module.exports = mongoose.model("Sales", salesSchema);
