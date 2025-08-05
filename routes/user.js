const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/User");
const { getUserProfile } = require("../controllers/authController");

// Existing profile route
router.get("/profile", authMiddleware, getUserProfile);

// ✅ Add this new PUT route to update profile
router.put("/update", authMiddleware, upload.single("profileImage"), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (req.file) updates.profileImage = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;