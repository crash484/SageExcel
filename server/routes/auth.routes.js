import express from "express"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { verifyToken } from "../middleware/auth.middleware.js"
import multer from "multer"
import UploadedFile from "../models/UploadedFile.js"

const router = express.Router();
dotenv.config();
const key=process.env.SECRET_KEY;

const storage = multer.memoryStorage();
const upload = multer({ storage });




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

          //jwt is created after verifying the user credentials are correct
          jwt.sign(user.toJSON(),key,{expiresIn:'1h'},(err,token)=>{

            if(err) console.log(err);

            res.status(201).json({token,message:"successfully logged in"});
            return;
          })
      }
    } catch (err) {
      console.error(err);  
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/verify',verifyToken,(req,res)=>{ 
    res.json({message:"user is verified"})
  });

  //method to upload the file
  router.post("/upload",verifyToken,upload.single('file'),async(req,res)=>{
    try{
      if(!req.file) return res.status(400).json({ message: 'No file Uploaded' });

      const userEmail = req.user.email;
      const user = await User.findOne({ email: userEmail });

      if(!user) return res.status(404).json({ message: "user doesnt exist" });

      console.log(user._id)

      const fileDoc = await UploadedFile.create({
        filename: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype,
        uploadedBy: user._id,
        size: req.file.size
      })

      user.uploadedFiles.push(fileDoc._id);
      await user.save();

      res.status(200).json({ message: 'File uploaded successfully', fileId: fileDoc._id });
    } catch(err) {
      console.error('upload error: ',err);
      res.status(500).json({ message: "server error" })
    }
  })

  //get method to get user 
  router.get("/getUser",async (req,res)=>{

  })
  
export default router;