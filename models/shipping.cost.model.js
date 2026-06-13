const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const shippingRateSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    stripeShippingRateId: {
      type: String,
      // required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "egp",
    },
  },
  { timestamps: true },
);

shippingRateSchema.index({ city: 1, area: 1 }, { unique: true });

module.exports = mongoose.model("ShippingRate", shippingRateSchema);
