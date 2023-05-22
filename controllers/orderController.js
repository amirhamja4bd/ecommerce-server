const Order = require('../models/OrderModel');
const braintree =require("braintree");
require("dotenv").config();
const sgMail =require("@sendgrid/mail");
const Product = require('../models/ProductModel');
const Cart = require('../models/CartModel');

sgMail.setApiKey(process.env.SENDGRID_KEY);

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.checkout = async (req, res) => {
  try {
    const { carts, shippingFee, tax, address, nonce } = req.body;
    // console.log("body",req.body)
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    let newTransaction = gateway.transaction.sale(
      {
        // amount: carts.total ,
        amount: cart.total + shippingFee,
        // address: address,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      
      async function (error, result) {
        console.error("error try",error)
        console.error("result",result)
        if (result) {
          try {
            // create order
            const order = new Order({
              user: req.user._id,
              products: cart,
              total: result.transaction.amount,
              shippingFee: shippingFee,
              address: address,
              paymentMethod: result.transaction.paymentInstrumentType,
              tax: tax,
              payment: result,
            });
            await order.save();

            // Decrement product quantity and increment sold
            if (result.success) {
              // Decrement product quantity And Increment Sold
              for (const item of cart.items) {
                const product = await Product.findById(item.product);
                if (product) {
                  product.quantity -= item.quantity;
                  product.sold += item.quantity;
                  await product.save();
                }
              }
            // Clear the cart
            cart.items = [];
            cart.total = 0;
            
            await cart.save();
            }
            res.json({ order: order });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server Error' });
          }
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


exports.orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate( orderId, { status },
      { new: true }
    ).populate("user", "email name");
    // send email

    // prepare email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: order.user.email,
      subject: "Order status",
      html: `
        <h1>Hi ${order.user.name}, Your order's status is: <span style="color:red;">${order.status}</span></h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };

    try {
      await sgMail.send(emailData);
    } catch (err) {
      console.log(err);
    }

    res.json(order);
  } catch (err) {
    console.log(err);
  }
};

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
      await order.remove();
      res.status(200).json({ message: "Order deleted" });
    } catch (err) {
      next(err);
    }
  };