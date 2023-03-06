// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const cartItemSchema = new Schema({
//   product: {
//     type: Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   totalPrice: {
//     type: Number,
//   }
// }, {timestamps: true , versionKey: false});

// const cartSchema = new Schema({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   items: [cartItemSchema],
//   total: {
//     type: Number,
//     required: true,
//     default: 0
//   },
// }, {timestamps: true , versionKey: false});

// cartSchema.methods.calculateSubTotal = function() {
//   let subTotal = 0;
//   for (let item of this.items) {
//     subTotal += item.price * item.quantity;
//   }
//   this.total = subTotal;
// };

// cartItemSchema.methods.calculateTotalPrice = function() {
//   return totalPrice = this.price * this.quantity;
// };

// const Cart = mongoose.model('Cart', cartSchema);

// module.exports = Cart;






const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, {timestamps: true , versionKey: false});

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    required: true,
    default: 0
  },
}, {timestamps: true , versionKey: false});

cartSchema.methods.calculateSubTotal = function() {
  let subTotal = 0;
  for (let item of this.items) {
    subTotal += item.price * item.quantity;
  }
  this.total = subTotal;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

