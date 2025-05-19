import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api/auth",authRoutes);
app.listen(port,()=> console.log("server running"))


