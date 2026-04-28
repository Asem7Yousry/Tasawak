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

// webhook to create shipping rates in Stripe when a new shipping rate is added to the database
shippingRateSchema.pre("save", async function () {
  this.city = this.city.trim().replace(/\s+/g, "-").toLowerCase();
  this.area = this.area ? this.area.trim().replace(/\s+/g, "-").toLowerCase() : undefined;
  if (!this.isNew) {
    // disaple old shipping rate in Stripe
    const oldShippingRate = await stripe.shippingRates.update(
      this.stripeShippingRateId,
      {
        active: false,
      },
    );
  } else {
    const existing = await this.constructor.findOne({
      city: this.city,
      area: this.area,
    });
    if (existing) {
      throw new ApiError("shipping price already exists", 409);
    }
  }

  try {
    const shippingRate = await stripe.shippingRates.create({
      display_name: `${this.city} - ${this.area}`,
      type: "fixed_amount",
      fixed_amount: {
        amount: this.cost * 100,
        currency: this.currency || "egp",
      },
      metadata: {
        city: this.city,
        area: this.area,
      },
    });
    this.stripeShippingRateId = shippingRate.id;
  } catch (err) {
    throw new ApiError(
      "Failed to create shipping rate in Stripe: " + err.message,
      500,
    );
  }
});

shippingRateSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    try {
      await stripe.shippingRates.update(this.stripeShippingRateId, {
        active: false,
      });
    } catch (err) {
      throw new ApiError(
        `Failed to archive Stripe shipping rate: ${err.message}`,
        500,
      );
    }
  },
);

shippingRateSchema.pre("deleteMany", async function () {
  try {
    const docsToDelete = await this.model.find(this.getQuery());
    if (!docsToDelete.length) return;
    await Promise.all(
      docsToDelete.map((doc) =>
        stripe.shippingRates.update(doc.stripeShippingRateId, {
          active: false,
        }),
      ),
    );
  } catch (err) {
    throw new ApiError(
      `Failed to archive Stripe shipping rates: ${err.message}`,
      500,
    );
  }
});

shippingRateSchema.index({ city: 1, area: 1 }, { unique: true });

module.exports = mongoose.model("ShippingRate", shippingRateSchema);
