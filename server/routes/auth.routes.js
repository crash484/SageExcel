import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import { verifyToken } from "../middleware/auth.middleware.js"; // ✅ JWT middleware

const router = express.Router();
dotenv.config();

const url = process.env.MONGO_URI;

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const DB = client.db(process.env.DB_NAME);
const collection = DB.collection(process.env.DB_COLLECTION);

router.post("/register", async (req, res) => {
  try {
    await client.connect();
    const { username, password, isAdmin } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = { username, password: hashed, isAdmin };
    const result = await collection.insertOne(user);

    if (result) res.status(201).json({ message: "User registered" });
    else res.status(403).json({ message: "Unable to register user" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
    console.log("Disconnected from database");
  }
});

router.post("/login", async (req, res) => {
  try {
    await client.connect();
    const { username, password } = req.body;
    const user = await collection.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
    console.log("Disconnected from database");
  }
});

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard!",
    user: req.user,
  });
});

export default router;
