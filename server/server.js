import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB via Mongoose");
        app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
    })
    .catch((err) => {
        console.error(" MongoDB connection error:", err);
    });
