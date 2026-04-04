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
  },
  {
    timestamps: true,
    minimize: false,
  },
);

module.exports = mongoose.model("Cart", cartSchema);
