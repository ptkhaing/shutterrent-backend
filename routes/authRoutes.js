const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { changePassword } = require('../controllers/authController');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      console.log("❌ Missing fields:", req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("✅ New user registered:", email);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Password change route
router.put('/change-password', authMiddleware, changePassword);

// ✅ Debug test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route working!' });
});

module.exports = router;