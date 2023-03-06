const Order = require('../models/OrderModel');

// Handle GET request for retrieving all orders
exports.getOrders = async (req, res, next) => {
    try {
      const orders = await Order.find().populate("user", "-password");
      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  };
  
  // Handle GET request for retrieving a single order by ID
  exports.getOrderById = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId).populate("user", "-password");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  };
  
  // Handle PUT request for updating an existing order
  exports.updateOrder = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
      const { status, paymentStatus } = req.body;
      order.status = status || order.status;
      order.paymentStatus = paymentStatus || order.paymentStatus;
      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } catch (err) {
      next(err);
    }
  };

  
  // Handle DELETE request for deleting an existing order
  exports.deleteOrder = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
      await order.remove();
      res.status(200).json({ message: "Order deleted" });
    } catch (err) {
      next(err);
    }
  };