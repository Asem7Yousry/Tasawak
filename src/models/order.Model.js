const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: Object,
      required: true
    },
    // items: [
    //   {
    //     productId: {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "Product",
    //       required: true,
    //     },
    //     variationId: {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "productVariation",
    //       required: true,
    //     },
    //     quantity: {
    //       type: Number,
    //       default: 1,
    //     },
    //     peacePrice: {
    //       type: Number,
    //       required: true,
    //     },
    //     _id: false,
    //   },
    // ],
    paymentMethod: {
      type: String,
      enum: ["cach", "card"],
      default: "cach",
    },
    paymentId: String,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    couponId: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
    },
    couponDiscount: Number, // Original discount value from coupon
    discountAmount: Number, // Actual discount amount applied
    subtotal: Number, // Total before discount
    totalAfterDiscount: Number, // Total after discount but before tax/shipping
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    canceledAt: Date,
    // address: String,
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.model("Order", orderSchema);
