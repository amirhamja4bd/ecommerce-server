
const express = require('express');
const router = express.Router();
const {  getOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isSignIn, isAdmin } = require('../middlewares/authMiddleware');


router.get("/orders", isSignIn, getOrders);
router.get("/order/:orderId",isSignIn, getOrderById);
router.put("/order/:orderId", isSignIn, isAdmin, updateOrder);
router.delete("/orders/:orderId", isSignIn, isAdmin, deleteOrder);

module.exports = router;