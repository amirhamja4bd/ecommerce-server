const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');


// Add a product to a user's cart

exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    const product = await Product.findById(productId);
    if (!cart) {
      const newCart = new Cart({ user: req.user._id });
      await newCart.save();
      cart = newCart;
    }

    const cartItem = cart.items.find(
      item => item.product.toString() === productId.toString()
    );

    if (cartItem) {
      cartItem.quantity += parseInt(quantity), 
      cartItem.totalPrice += product.price * parseInt(quantity);
    } else {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const cartItem = { product: productId, quantity, price: product.price , totalPrice: product.price * parseInt(quantity)};
      cart.items.push(cartItem);
    }
    
    cart.calculateSubTotal();
    await cart.save();

    

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({path:"items.product", select:"-photo"}).populate({path:"user", select:"-password -photo"})
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cart.items.find(item => item._id.toString() === itemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const product = cart.items.find((p) => p._id.toString() === itemId);

    if (!product) {
      return res.status(404).json({ message: 'Product Not Found' });
    }

    cartItem.quantity = quantity;
    cartItem.totalPrice = product.price * quantity;
    cart.calculateSubTotal();
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cart.items.splice(cartItemIndex, 1);
    cart.calculateSubTotal();
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// exports.checkout = async (req, res) => {
//   try {
//     const { shippingFee, shippingMethod, tax , nonce } = req.body;
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     if (cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     let newTransaction = gateway.transaction.sale(
//       {
//         amount: cart.total,
//         paymentMethod: nonce,
//         user: req.user._id,
//         products: cart.items,
//         shippingFee,
//         shippingMethod,
//         tax,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (error, result) {
//         if (result) {
//           // res.send(result);
//           // create order
//           const order = new Order({
//             products: cart,
//             payment: result,
//             buyer: req.user._id,
//           }).save();

//           res.json({ ok: true });
//         } else {
//           res.status(500).send(error);
//         }
//       }
//     );

//     // Decrement product quantity And Increment Sold
//     for (const item of cart.items) {
//       const product = await Product.findById(item.product);
//       if (product) {
//         product.quantity -= item.quantity;
//         product.sold += item.quantity;
//         await product.save();
//       }
//     }

//     // Clear the cart
//     cart.items = [];
//     cart.total = 0;
//     await cart.save();

//     return res.status(200).json(order);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server Error' });
//   }
// };


// exports.checkout = async (req, res) => {
//   try {
//     const { shippingFee, shippingMethod, tax, nonce } = req.body;
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     if (cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     const result = await gateway.transaction.sale({
//       amount: cart.total,
//       paymentMethodNonce: nonce,
//       customerId: req.user._id,
//       shipping: {
//         amount: shippingFee,
//         name: 'Shipping',
//         description: shippingMethod
//       },
//       taxAmount: tax,
//       options: {
//         submitForSettlement: true
//       }
//     });

//     if (result.success) {
//       // Decrement product quantity And Increment Sold
//       for (const item of cart.items) {
//         const product = await Product.findById(item.product);
//         if (product) {
//           product.quantity -= item.quantity;
//           product.sold += item.quantity;
//           await product.save();
//         }
//       }

//       // Clear the cart
//       cart.items = [];
//       cart.total = 0;
//       await cart.save();

//       // Create an order
//       const orderProducts = cart.items.map(item => ({
//         product: item.product,
//         quantity: item.quantity
//       }));
//       const order = new Order({
//         buyer: req.user._id,
//         products: orderProducts,
//         payment: {
//           id: result.transaction.id,
//           amount: result.transaction.amount,
//           currency: result.transaction.currencyIsoCode
//         }
//       });
//       await order.save();

//       return res.status(200).json(order);
//     } else {
//       return res.status(400).json({ message: 'Payment failed' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server Error' });
//   }
// };

// exports.checkout = async (req, res) => {
//   try {
//     const { paymentMethod, shippingFee, shippingMethod, tax } = req.body;
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     if (cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     // Create an order
//     const order = new Order({
//       user: req.user._id,
//       products: cart.items,
//       total: cart.total,
//       paymentMethod,
//       shippingFee,
//       shippingMethod,
//       tax,
//     });
//     await order.save();

//     // Decrement product quantity And Increment Sold
//     for (const item of cart.items) {
//       const product = await Product.findById(item.product);
//       if (product) {
//         product.quantity -= item.quantity;
//         product.sold += item.quantity;
//         await product.save();
//       }
//     }

//     // Clear the cart
//     cart.items = [];
//     cart.total = 0;
//     await cart.save();

//     return res.status(200).json(order);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server Error' });
//   }
// };