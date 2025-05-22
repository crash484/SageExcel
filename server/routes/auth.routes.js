import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

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
        } else  {
          res.status(201).json( { message: "successfully logged in" } ); 
          // //jwt is created after verifying the user credentials are correct
          jwt.sign(user,key,{expiresIn:'1h'},(err,token)=>{
            if(err) console.log(err);
            //need to send token
            return;
          })
      }
    } catch (err) {
        console.error("Error unable to find user");
        res.status(500).json({ error: err.message });
    }
  })

  
  
export default router;