const express = require('express');
const { isSignIn, isAdmin } = require('../middlewares/authMiddleware');
const formidable =require("express-formidable");
const { createAddress,  getAllAddresses,  getAddressById, updateAddress, } = require('../controllers/addressController');

const router = express.Router();

router.post('/addresses', isSignIn , createAddress);
router.get('/addresses', isSignIn , getAllAddresses);
router.get('/address', isSignIn , getAddressById);
router.put('/addresses/:id', isSignIn , updateAddress);


module.exports = router;