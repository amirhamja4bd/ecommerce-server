const Coupon = require('../models/CouponModel');

// POST /coupons
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, minPurchase, expirationDate, usageLimit, applicableProducts, conditions ,totalPrice } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create new coupon
    const coupon = new Coupon({
      code,
      discountType,
      discountAmount,
      minPurchase,
      expirationDate,
      usageLimit,
      applicableProducts,
      conditions,
    });

    if (applicableProducts !== 'all') {
      return res.status(400).json({ message: 'Coupon is not applicable to any products in the cart or order' });
    }

    let discount = 0;
    if (discountType === 'percentage') {
      discount = (discountAmount / 100) * totalPrice;
    } else if (discountType === 'fixed') {
      discount = discountAmount;
    }

    // if (discount < minPurchase) {
    if (totalPrice < minPurchase) {
      return res.status(400).json({ message: `Discount does not meet the minimum purchase ${minPurchase}` });
    }

    await coupon.save();

    // Return success response
    res.json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
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

// PUT /coupons/:id
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Check if coupon exists
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if applicableProducts condition is met
    if (coupon.applicableProducts !== 'all') {
      return res.status(400).json({ message: 'Coupon is not applicable to any products in the cart or order' });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (coupon.discountAmount / 100) * req.body.totalPrice;
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountAmount;
    }

    // Check if discount meets the minPurchase condition
    if (req.body.totalPrice < coupon.minPurchase) {
      return res.status(400).json({ message: 'Discount does not meet the minimum purchase requirement' });
    }

    // Save the updated coupon to the database
    await coupon.save();

    // Return success response
    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
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