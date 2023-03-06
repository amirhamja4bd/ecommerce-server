const express = require('express');
const { create, list, read, update, remove, productsByCategory, photo, readById } = require('../controllers/categoriesController');
const { isAdmin, isSignIn } = require('../middlewares/authMiddleware');
const formidable =require("express-formidable");

const router = express.Router();

router.post("/category", isSignIn, isAdmin, formidable(), create);
router.get("/categories", list);
router.get("/category/:slug", read);
// router.get("/category/:slug", readById);
router.get("/category/photo/:categoryId", photo);
router.put("/category/:categoryId", isSignIn, isAdmin, formidable(), update);
router.delete("/category/:categoryId", isSignIn, isAdmin, remove);
router.get("/products-by-category/:slug", productsByCategory);





module.exports = router;