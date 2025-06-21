import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import mongoose from "mongoose"
import cors from "cors"

dotenv.config();
const app = express();
const PORT = 7860;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin allowed
  credentials: true, // if you use cookies or authentication headers
  allowedHeaders: ['Content-Type', 'Authorization'],

}));
app.use("/api/auth",authRoutes);



mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("connected to database");
          app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
          if (process.env.HF_SPACE_ID) {
            // If running on Hugging Face Spaces, construct the public URL
            console.log(`Base API URL: https://${process.env.HF_SPACE_ID}.hf.space/`);
            console.log(`Example: https://${process.env.HF_SPACE_ID}.hf.space/api/your-route`);
          } else {
            // Localhost
            console.log(`Base API URL: http://localhost:${PORT}/`);
            console.log(`Example: http://localhost:${PORT}/api/your-route`);
          }
        });
        })
        .catch((err)=>{
            console.error("Error while connecting to database: ",err);
        });


