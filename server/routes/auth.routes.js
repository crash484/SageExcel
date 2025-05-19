import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { MongoClient, ServerApiVersion } from "mongodb";

const router = express.Router();
dotenv.config();


const url = process.env.MONGO_URI;

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict:true,
        deprecationErrors: true,
    }
});

const DB = client.db(process.env.DB_NAME);
const collection = DB.collection(process.env.DB_COLLECTION)


//signup
router.post('/register',async (req,res)=>{
    try{

    await client.connect();
    const {username,password,isAdmin} = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, isAdmin });
    const result = await collection.insertOne(user);

    if (result) res.status(201).json({ message: 'User registered' });
    else res.status(403).json({ message: 'unable to register user'})

    } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: err.message });
  } finally{
    client.close();
    console.log("disconnected from database");
  }
});


export default router;