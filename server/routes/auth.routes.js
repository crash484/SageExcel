import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { MongoClient, ServerApiVersion } from "mongodb";

const router = express.Router();
dotenv.config();





//signup
router.post('/register',async (req,res)=>{
    try{

    const {username,password,isAdmin} = req.body;
    const hashed = await bcrypt.hash(password, 10); //hashing the password
    const user = new User({ username, password: hashed, isAdmin }); //creating new object to store in db
    const result = await user.save();

    if (result) return res.status(201).json({ message: 'User registered' });
    else return res.status(403).json({ message: 'unable to register user'})
    } catch (err) {
    console.error('Error saving user:', err);
    return res.status(500).json({ error: err.message });
  }
});

//signin
  router.post('/login', async (req,res)=>{
    try{
      const {username,password}=req.body;
      const user = await User.findOne({username});
      if( !user  ) {
        return res.status( 401 ).json( { message : "user doesnt exist" } );
      }

      //comparing the password
      const isMatch= await bcrypt.compare(password,user.password);
      if( !isMatch ) return res.status(401).json( { message: 'Invalid password' } );
      else return res.status(201).json( { message: "successfully logged in" } ); //will redirect to home page if true

    } catch (err) {
      console.error("Error unable to find user");
      return res.status(500).json({ error: err.message });
    }
  })

  //implement the jwt here
export default router;