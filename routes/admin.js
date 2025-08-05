const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const { authMiddleware } = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");

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

router.get("/listings", authMiddleware, adminCheck, async (req, res) => {
  try {
    const listings = await Listing.find().populate("user", "email");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/listings/:id", authMiddleware, adminCheck, upload.single("image"), async (req, res) => {
  try {
    const { title, description, pricePerDay } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : undefined;

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.pricePerDay = pricePerDay || listing.pricePerDay;
    if (image) listing.image = image;

    await listing.save();
    res.json({ message: "Listing updated successfully", listing });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/listings/:id", authMiddleware, adminCheck, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ message: "Listing deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", authMiddleware, adminCheck, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.delete("/users/:id", authMiddleware, adminCheck, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
const Booking = require("../models/Booking");

router.delete("/bookings/:id", authMiddleware, adminCheck, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});
// Update booking status
router.put("/bookings/:id/status", authMiddleware, adminCheck, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Confirmed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();
    res.json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking status" });
  }
});
router.get("/bookings", authMiddleware, adminCheck, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("listing", "title");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

module.exports = router;