const express = require('express');
const { create, list, read, update, remove, photo } = require('../controllers/brandController');
const { isAdmin, isSignIn } = require('../middlewares/authMiddleware');
const formidable =require("express-formidable");

const router = express.Router();

router.post("/brand", isSignIn, isAdmin, formidable(), create);
router.get("/brands", list);
router.get("/brand/:slug", read);
router.get("/brand/photo/:brandId", photo);
router.put("/brand/:brandId", isSignIn, isAdmin, formidable(), update);
router.delete("/brand/:brandId", isSignIn, isAdmin, remove);
// router.get("/products-by-brand/:slug", productsByBrand);





module.exports = router;