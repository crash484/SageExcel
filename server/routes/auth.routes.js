import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";


dotenv.config();
const router = express.Router();

// 📝 Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: "User already exists" });

    // Hash password and save user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed, isAdmin });
    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🗝️ Login Route (optional to test JWT)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to protected dashboard!",
    user: req.user, // contains id and isAdmin
  });
});

export default router;
