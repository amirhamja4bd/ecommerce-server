const User = require("../models/UserModel");
const Address = require("../models/AddressModel");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const OTPModel = require("../models/otpModel");
const SendEmailUtility = require("../utility/SendEmailUtility");
require("dotenv").config;
const fs =require("fs");

exports.register = async (req, res )=> {
    try {
    const {firstName, lastName, phone , email , password ,photo} = req.body;

    if(!firstName.trim()){
        return res.json({error: "First Name is Required"})
    }
    if(!lastName.trim()){
        return res.json({error: "Last Name is Required"})
    }
    if(!phone.trim()){
        return res.json({error: "Mobile Number is Required"})
    }
    if(!email){
        return res.json({error: "Email is Required"})
    }
    if(!password || password.length < 6){
        return res.json({error: "Password must be at least 6 characters"});
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
        return res.json({error: "Email already taken"});
    }

    const hashedPassword = await hashPassword(password);

    const fullName = firstName + ' ' + lastName 

    const user = await new User({ firstName, lastName, fullName : fullName, phone , email , password : hashedPassword ,photo}).save();

    const token = jwt.sign({ _id: user._id , email: user.email }, process.env.JWT_SECRET_KEY,{ expiresIn: "7d"});
    
    res.json({
        user:{
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role
        }, token
    })
    }catch(error){
        console.log(error);
    }
};

//Login
exports.login = async (req, res ) =>{
    try{
    const { email, password } = req.body;
    if(!email){
        return res.json({ error:"Email is taken"})
    }
    if(!password || password.length <6){
        return res.json({error:"Password must be at least 6 characters "})
    }
    const user = await User.findOne({email});
    if(!user){
        return res.json({error:"User Not Found"})
    }
    const match =await comparePassword(password, user.password);
    if(!match){
        return res.json({error:"Wrong password"})
    }
    const token = jwt.sign({ _id: user._id , email: user.email, role: user.role, photo: user.photo  }, process.env.JWT_SECRET_KEY, { expiresIn: "7d", } );
    
    res.json({
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            photo: user.photo,
            role: user.role,
        },
        token
    });
    }
    catch(error){
        console.log(error);
    }
};

// Profile Update
exports.profileUpdate = async (req, res) => {
    try{
        const { firstName, lastName } = req.fields;
        const { photo } = req.files;
        const user = await User.findById(req.user._id);
        // check password length

        const fullName = firstName + ' ' + lastName 
        const updated = await User.findByIdAndUpdate(req.user._id, 
            { ...req.fields, fullName }, {new: true} );

            if (photo) {
                updated.photo.data = fs.readFileSync(photo.path);
                updated.photo.contentType = photo.type;   
            }
            await updated.save();
            updated.password = undefined;
            updated.address = undefined;
            res.json(updated);
    }
    catch(error){
        console.log(error);
    }
}

exports.password = async (req, res) => {
    try {
      const password = req.fields?.password;
      
      if (!password) {
        return res.json({ error: "Password is required" });
      }
      if (password.length < 6) {
        return res.json({ error: "Password must be at least 6 characters" });
      }
      const hashedPassword = await hashPassword(password);
      const updated = await User.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true });
      res.json(updated);
    } catch (error) {
      console.log(error);
    }
  };

exports.getUser = async (req, res) => {
    try {
      const user = await User.findOne({ user: req.user._id}).select('-password');
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
// Recover Verify Email
exports.recoverVerifyEmail=async (req,res)=>{
    let email = req.params.email;
    let OTPCode = Math.floor(100000 + Math.random() * 900000)
    try {
        // Email Account Query
        let UserCount = (await User.aggregate([{$match: {email: email}}, {$count: "total"}]))
        if(UserCount.length>0){
            // OTP Insert
            let CreateOTP = await OTPModel.create({email: email, otp: OTPCode})
            // Email Send
            let SendEmail = await SendEmailUtility(email,"Your PIN Code is= "+OTPCode,"Ecommerce Website PIN Verification")
            res.status(200).json({status: "success", data: SendEmail})
            // res.header("Access-Control-Allow-Origin", "*");
            // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        }
        else{
            res.status(400).json({status: "fail", data: "No User Found"})
        }

    }catch (error) {
        res.status(400).json({status: "fail", data: error})
    }

}

// Verify OTP
exports.recoverVerifyOTP=async (req,res)=>{
    let email = req.params.email;
    let OTPCode = req.params.otp;
    let status=0;
    let statusUpdate=1;
    try {
        let OTPCount = await OTPModel.aggregate([{$match: {email: email, otp: OTPCode, status: status}}, {$count: "total"}])
        if (OTPCount.length>0) {
            let OTPUpdate = await OTPModel.updateOne({email: email, otp: OTPCode, status: status}, { email: email, otp: OTPCode, status: statusUpdate })

            res.status(200).json({status: "success", data: OTPUpdate})
        } else {
            res.status(400).json({status: "fail", data: "Invalid OTP Code"})
        }
    }
    catch (error) {
        res.status(400).json({status: "fail", data:error})
    }
}

// Password Creation
exports.recoverResetPass=async (req,res)=>{

    let email = req.body['email'];
    let OTPCode = req.body['otp'];
    let NewPass =  req.body['password'];
    let statusUpdate=1;

    try {
        let OTPUsedCount = await OTPModel.aggregate([{$match: {email: email, otp: OTPCode, status: statusUpdate}}, {$count: "total"}])
        if (OTPUsedCount.length>0) {

            // PAssword Hash
            const hashedPassword = NewPass ? await hashPassword(NewPass) : undefined;
            
            let PassUpdate = await User.updateOne({email: email}, { password: hashedPassword })
            res.status(200).json({status: "success", data: PassUpdate})
        } else {
            res.status(400).json({status: "fail", data: "Invalid Request"})
        }
    }
    catch (error) {
        res.status(400).json({status: "fail", data:error})
    }
}


// Address Update 
// Profile Update
exports.addressUpdate = async (req, res) => {
    try{
        const updated = await User.findByIdAndUpdate(req.user._id, 
            { ...req.fields, user: req.user._id }, {new: true} );

            await updated.save();
            res.json(updated);
    }
    catch(error){
        console.log(error);
    }
}