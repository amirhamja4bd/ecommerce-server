const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    // products: [{ 
    //   type: mongoose.Schema.Types.ObjectId, 
    //   ref: "Product" ,
    //   required: true,
    // }],
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
    },

    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    shippingFee: {
      type: Number,
    },

    tax: {
      type: Number,
      default: 0,
    },

    payment:{},

    address:{
      type: String,
      required: true,
    },
  },

  { timestamps: true, versionKey: false }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
