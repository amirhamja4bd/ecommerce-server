const express = require('express');
const { register, login, profileUpdate, recoverVerifyEmail, recoverVerifyOTP, recoverResetPass, getUser, photo, password, addressUpdate } = require('../controllers/userController');
const { isSignIn, isAdmin } = require('../middlewares/authMiddleware');
const formidable =require("express-formidable");

const router = express.Router();

// User
router.post('/register', formidable() , register)
router.post('/login', login)
router.put('/profile', isSignIn , formidable(), profileUpdate)
router.put('/password', isSignIn , formidable(), password)
router.get('/user', isSignIn , getUser)

// Password Forgot
router.get('/recover-verify-email/:email', recoverVerifyEmail)
router.get('/recover-verify-otp/:email/:otp', recoverVerifyOTP)
router.post('/recover-reset-password', recoverResetPass)

// Role Based Authentication
router.get('/is-user', isSignIn, (req, res)=>{
    res.json({ok: true});
} );
router.get('/is-admin', isSignIn, isAdmin, (req, res)=>{
    res.json({ok: true});
} );





module.exports = router;