const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema({
  tagNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ["Cow", "Goat", "Sheep", "Pig", "Chicken", "Other"], 
    required: true 
  },
  breed: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  age: { type: Number, required: true },
  generation: { type: String },
  weight: { type: Number },
  colorMarkings: { type: String },
  dateOfBirth: { type: Date },
  acquisitionDate: { type: Date },
  animalPhoto: { type: String }, // Cloudinary / S3 URL
  health: { type: mongoose.Schema.Types.ObjectId, ref: "Health" },
  sales: { type: mongoose.Schema.Types.ObjectId, ref: "Sales" },
}, { timestamps: true });

module.exports = mongoose.model("Animal", animalSchema);
