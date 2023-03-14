const express = require('express');
const { create, list, findByProductId, deleteWish } = require('../controllers/wishListController');
const { isSignIn } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post("/create-wishlist", isSignIn, create);
router.get("/wishlists", isSignIn, list);
router.get("/wishlist/:productId", isSignIn, findByProductId);
router.delete("/wishlist/:id", isSignIn, deleteWish);






module.exports = router;