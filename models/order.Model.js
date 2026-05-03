const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        variationId: {
          type: mongoose.Schema.ObjectId,
          ref: "productVariation",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        _id: false,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
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
    couponApplied: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
    couponDiscount: Number, // Original discount value from coupon
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
    },
    discountAmount: Number, // Actual discount amount applied
    subtotal: Number, // Total before discount
    totalAfterDiscount: Number, // Total after discount but before tax/shipping
    status: {
      type: String,
      enum: ["pending", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.model("Order", orderSchema);
