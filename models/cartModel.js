const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique:true,
    },
    items: [
      {
        _id: false,
        productName: String,
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Products",
        },
        piecePrice: Number,
        quantity: {
          type: Number,
          required: true,
          min:1,
        },
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Cart", cartSchema);
