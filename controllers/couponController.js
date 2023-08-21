const Coupon = require('../models/CouponModel');
const Cart = require('../models/CartModel');

exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get a specific coupon by code
exports.applyCouponCode = async (req, res) => {
  try {
    const code =req.params.code
    const userId =req.user._id

    const coupon = await Coupon.findOne({ code });
    const cart = await Cart.findOne({ user: userId });

    if (!coupon) return res.status(400).json({ error: "Coupon not found" });
    // if (!coupon) return { status: 404, error: "Coupon Not Found" };
    if (!cart || cart.items.length < 1)
      return { status: 404, error: "Cart Not Found" };

    const totalPrice = cart.items.reduce(
      (total, product) => total + product.totalPrice,
      0
    );
    const currentDate = new Date().getTime();

    if (cart.couponApplied)
    return res.status(200).json({error: "Coupon Already Applied"});

    if (totalPrice < coupon.minPurchase)
    return res.status(200).json({error: `Plesase order more than $${coupon.minPurchase}`});
      
    if (currentDate > coupon.expirationDate.getTime())
    return res.status(200).json({error: "Coupon has expired"});

    if (coupon.usageLimit <= 0)
    return res.status(200).json({error: "Coupon usage limit exceeded"});

    cart.total -= calculateDiscount(coupon, totalPrice);
    cart.couponApplied = true;
    coupon.usageLimit -= 1;
    
    await cart.save();
    await coupon.save();
    
    res.status(200).json({message: "Coupon Successfully Applied", cart});
  } catch (error) {
    return res.status(400).json({ error: "Something want Wrong" });
  }
};

const calculateDiscount = (coupon, subTotal) => {
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (coupon.discountAmount / 100) * subTotal;
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountAmount;
  }
  return discount;
};

// GET /coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.read = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.params.id });
    res.json(coupon);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// PUT /coupons/:id
// exports.updateCoupon = async (req, res) => {
//   try {
//     const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     // Check if coupon exists
//     if (!coupon) {
//       return res.status(404).json({ message: 'Coupon not found' });
//     }

//     // Check if applicableProducts condition is met
//     if (coupon.applicableProducts !== 'all') {
//       return res.status(400).json({ message: 'Coupon is not applicable to any products in the cart or order' });
//     }
    
//     let discount = 0;
//     if (coupon.discountType === 'percentage') {
//       discount = (coupon.discountAmount / 100) * req.body.totalPrice;
//     } else if (coupon.discountType === 'fixed') {
//       discount = coupon.discountAmount;
//     }

//     // Check if discount meets the minPurchase condition
//     if (req.body.totalPrice < coupon.minPurchase) {
//       return res.status(400).json({ message: 'Discount does not meet the minimum purchase requirement' });
//     }

//     // Save the updated coupon to the database
//     await coupon.save();

//     // Return success response
//     res.json({ message: 'Coupon updated successfully', coupon });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCoupon = req.body;
    const coupon = await Coupon.findByIdAndUpdate(id, updatedCoupon, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// DELETE /coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};