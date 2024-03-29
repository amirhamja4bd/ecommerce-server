const express = require('express');
const { isAdmin, isSignIn } = require('../middlewares/authMiddleware');
const { createCoupon, getCoupons, updateCoupon, deleteCoupon, applyCouponCode, read } = require('../controllers/couponController');

const router = express.Router();

router.post('/coupon', isSignIn, isAdmin, createCoupon);
router.get('/coupons/:code', isSignIn, applyCouponCode);
router.get('/coupons', isSignIn, isAdmin, getCoupons);
router.get('/coupon/:id', isSignIn, isAdmin, read);
router.put('/coupon/:id', isSignIn, isAdmin, updateCoupon);
router.delete('/coupon/:id', isSignIn, isAdmin, deleteCoupon);




module.exports = router;