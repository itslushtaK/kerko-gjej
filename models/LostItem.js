// models/LostItem.js
const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the lost item
    description: { type: String, required: true }, // Description of the lost item
    datePosted: { type: Date, default: Date.now }, // Date when the item was posted
    image: { type: String, required: false }, // URL of the image
    phoneNumber: { type: String, required: true }, // Contact phone number
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // ID of the user who posted
    approved: { type: Boolean, default: false }, // Indicates if the item is approved
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostItem", LostItemSchema);
