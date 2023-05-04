const express = require('express');
const { addItemToCart, getCart, updateCartItem, deleteCartItem, checkout, } = require('../controllers/cartController');
const { isSignIn } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/cart', isSignIn, addItemToCart);
router.get('/carts', isSignIn, getCart);
router.put('/cart', isSignIn, updateCartItem);
router.delete('/cart/:itemId', isSignIn, deleteCartItem);
// router.post('/checkout', isSignIn, checkout);

module.exports = router;