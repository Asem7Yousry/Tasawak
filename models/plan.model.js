const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    costs: [
      {
        price: {
          type: Number,
          required: true,
          min: 0.1,
        },
        currency: {
          type: String,
          default: "egp",
        },
        interval: {
          type: String,
          enum: ["day", "week", "month", "year"],
          required: true,
        },
        interval_count: {
          type: Number,
          default: 1,
        },
        stripePriceId: {
          type: String,
          required: true,
        },
      },
    ],
    stripeProductId: {
      type: String,
      required: true,
    },
    subscriptionCount: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: undefined,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Plan", planSchema);
