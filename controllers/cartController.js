const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');



// // Add a product to a user's cart
// exports.addItemToCart = async (req, res) => {
//   const { productId, quantity } = req.body;
//   try {
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     const existingItemIndex = cart.items.findIndex(
//       item => item.product.toString() === productId
//     );
//     if (existingItemIndex !== -1) {
//       cart.items[existingItemIndex].quantity += parseInt(quantity);
//       cart.items[existingItemIndex].calculateSubTotal();
//     } else {
//       const item = {
//         product: productId,
//         quantity: parseInt(quantity),
//         price: product.price,
//       };
//       item.calculateSubTotal();
//       cart.items.push(item);
//     }
//     cart.calculateSubTotal();
//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const newCart = new Cart({ user: req.user._id });
      await newCart.save();
      cart = newCart;
    }

    const cartItem = cart.items.find(
      item => item.product.toString() === productId.toString()
    );

    if (cartItem) {
      cartItem.quantity += parseInt(quantity);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const cartItem = { product: productId, quantity, price: product.price };
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
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product").populate("user")
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

    cartItem.quantity = quantity;
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
    const { itemId } = req.body;
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

exports.checkout = async (req, res) => {
  try {
    const { paymentMethod, shippingFee, shippingMethod, tax } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create an order
    const order = new Order({
      user: req.user._id,
      products: cart.items,
      total: cart.total,
      paymentMethod,
      shippingFee,
      shippingMethod,
      tax,
    });
    await order.save();

    // Decrement product quantity
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

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};