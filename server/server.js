import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import mongoose from "mongoose"

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api/auth",authRoutes);

mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("connected to database");
            app.listen(port,()=> console.log("server running"));
        })
        .catch((err)=>{
            console.error("Error while connecting to database: ",err);
        });

