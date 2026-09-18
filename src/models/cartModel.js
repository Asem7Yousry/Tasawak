const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: Object,
      default: {},
    },
    totalPrice: { type: Number, default: 0, min: 0 },
    coupon: String,
    couponId: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage", "freeShipping"],
    },
    couponDiscount: Number, // Original discount value from coupon
    discountAmount: Number, // Actual discount amount applied
    subtotal: Number, // Total before discount
    totalAfterDiscount: Number, // Total after discount but before tax/shipping
  },
  {
    timestamps: true,
    minimize: false, // to save empty object strictely 
    strict: false,
  },
);

module.exports = mongoose.model("Cart", cartSchema);
