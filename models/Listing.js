const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
  type: String,
  required: true,
    },
    description: {
      type: String,
      required: true
    },
    pricePerDay: {
      type: Number,
      required: true
    },
    image: {
      type: String, // This will store the local image path (e.g., uploads/image123.jpg)
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);