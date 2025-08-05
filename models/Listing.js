const mongoose = require("mongoose");
const Listing = require("../models/Listing");

router.post("/seed", async (req, res) => {
  try {
    const dummyUserId = new mongoose.Types.ObjectId(); // Replace with real user ID if needed

    const sampleListings = [
      {
        user: dummyUserId,
        title: "Canon EOS R6",
        category: "Mirrorless",
        description: "Full-frame mirrorless with 20MP sensor and great autofocus",
        pricePerDay: 30000,
        image: "" // optional
      },
      {
        user: dummyUserId,
        title: "Sony A7 III",
        category: "Mirrorless",
        description: "Versatile mirrorless with excellent low light performance",
        pricePerDay: 28000,
        image: ""
      }
    ];

    await Listing.insertMany(sampleListings);
    res.json({ message: "Sample listings inserted" });
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).json({ message: "Failed to seed listings" });
  }
});