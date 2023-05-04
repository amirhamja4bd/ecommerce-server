
const express = require('express');
const router = express.Router();
const {  getOrders, getOrderById, updateOrder, deleteOrder, checkout, getToken, orderStatus } = require('../controllers/orderController');
const { isSignIn, isAdmin } = require('../middlewares/authMiddleware');


router.get("/orders", isSignIn, getOrders);
router.get("/order/:orderId",isSignIn, getOrderById);
router.put("/order/:orderId", isSignIn, isAdmin, updateOrder);
router.delete("/orders/:orderId", isSignIn, isAdmin, deleteOrder);

router.get("/braintree/token", getToken);
router.post('/checkout', isSignIn, checkout);
router.put("/order-status/:orderId", isSignIn, isAdmin, orderStatus);

module.exports = router;