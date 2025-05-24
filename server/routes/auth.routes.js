import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router();
dotenv.config();
const key=process.env.SECRET_KEY;




//signup
router.post('/register',async (req,res)=>{
    try{
    console.log(req.body);
    const {name,email,password} = req.body;
    //create check if user with email already exists or not
    const hashed = await bcrypt.hash(password, 10); //hashing the password

    const user = new User({ name,email, password: hashed }); //creating new object to store in db

    const result = await user.save();

    if (result) {
      return res.status(201).json({ message: 'User registered' });
    }
    else {
      return res.status(403).json({ message: 'unable to register user'})
    }
    } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: err.message });
  }
});

//signin
  router.post('/login', async (req,res)=>{
    try{
      const {email,password}=req.body;
      const user = await User.findOne({email});

      if( !user  ) {
         res.status( 401 ).json( { message : "user doesnt exist" } );
         //refresh the page
      }

      //comparing the password
      const isMatch= await bcrypt.compare(password,user.password);

      if( !isMatch ) {
         res.status(401).json( { message: 'Invalid password' } );
         //refresh the page
         return;

        } else {

          // //jwt is created after verifying the user credentials are correct
          jwt.sign(user.toJSON(),key,{expiresIn:'1h'},(err,token)=>{

            if(err) console.log(err);
            //need to send token
            res.status(201).json({token,message:"successfully logged in"});
            return;
          })
      }
    } catch (err) {
      console.error(err);  
      res.status(500).json({ error: err.message });
    }
  })

  router.post('/verify',verifyToken,(req,res)=>{ 
    res.json({message:"user is verified"})
  })
  
export default router;