const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
  estimatedPrice: { type: Number },
  forSale: { type: Boolean, default: false },
  dateListed: { type: Date },
  buyerInfo: { type: String },
  meatYield: { type: Number },
  purpose: { 
    type: String, 
    enum: ["Breeding", "Milk", "Meat", "Sale"], 
    default: "Sale" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Sales", salesSchema);
