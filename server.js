const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/user");
const listingRoutes = require("./routes/listing");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
"https://shutterrent-frontend.vercel.app"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ Safe fallback for unknown API routes only
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
);
  })
  .catch((err) => console.error(err));