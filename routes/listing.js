const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const { authMiddleware } = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const multer = require("multer");

// ⚠️ Replace with an actual user ID from your MongoDB
const REAL_USER_ID = "688a27b4101acf49cef2701b";
const realUserObjectId = new mongoose.Types.ObjectId(REAL_USER_ID);

// Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });

// @route   POST /api/listings
// @desc    Admin: Create new listing
router.post("/", authMiddleware, adminCheck, upload.single("image"), async (req, res) => {
  try {
    const { title, description, pricePerDay, category } = req.body;
    const image = req.file ? req.file.path : null;

    const listing = new Listing({
      user: req.user._id,
      title,
      description,
      pricePerDay,
      category,
      image,
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/listings
// @desc    Public: Get listings (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { title, minPrice, maxPrice, category } = req.query;
    const filter = {};

    if (title) filter.title = { $regex: title, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/listings/categories
// @desc    Public: Get unique listing categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Listing.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/listings/:id
// @desc    Public: Get listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/listings/:id
// @desc    Admin: Edit listing
router.put("/:id", authMiddleware, adminCheck, upload.single("image"), async (req, res) => {
  try {
    const { title, description, pricePerDay, category } = req.body;
    const image = req.file ? req.file.path : undefined;

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.pricePerDay = pricePerDay || listing.pricePerDay;
    listing.category = category || listing.category;
    if (image) listing.image = image;

    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Admin: Delete listing
router.delete("/:id", authMiddleware, adminCheck, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/listings/seed
// @desc    TEMP: Insert sample listings
router.post("/seed", async (req, res) => {
  try {
    const sampleListings = [
      {
        title: "Canon EOS R6",
        description: "Full-frame mirrorless with 20.1MP, great for video.",
        pricePerDay: 45000,
        image: "sample1.jpg",
        category: "DSLR",
        user: realUserObjectId
      },
      {
        title: "Sony A7 III",
        description: "Excellent low-light mirrorless camera.",
        pricePerDay: 50000,
        image: "sample2.jpg",
        category: "Mirrorless",
        user: realUserObjectId
      },
      {
        title: "Panasonic Lumix GH6",
        description: "Perfect for high-quality 4K video shooting.",
        pricePerDay: 60000,
        image: "sample3.jpg",
        category: "Cinema",
        user: realUserObjectId
      }
    ];

    await Listing.insertMany(sampleListings);
    res.json({ message: "✅ Sample listings inserted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error seeding listings" });
  }
});

module.exports = router;