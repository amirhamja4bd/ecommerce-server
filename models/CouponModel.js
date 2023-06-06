const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    applicableProducts: {
      type: [String],
      default: ["all"],
    },
    conditions: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

couponSchema.pre('save', function (next) {
  this.code = this.code.replace(/\s+/g, '');
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;