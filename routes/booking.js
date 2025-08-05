const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    const existingBookings = await Booking.find({
      listing: listingId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: "Booking conflict" });
    }

    const booking = new Booking({
      user: req.user._id,
      listing: listingId,
      startDate,
      endDate
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing")
      .sort({ startDate: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Allow user who created it or an admin to delete
    if (
      booking.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;