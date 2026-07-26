const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../apiError");

class stripeShippingRate {
  static async createShippingRate(shippingRateData) {
    const { city, area, cost, currency } = shippingRateData;
    try {
      const shippingRate = await stripe.shippingRates.create({
        display_name: `${city} - ${area}`,
        type: "fixed_amount",
        fixed_amount: {
          amount: cost * 100,
          currency: currency || "egp",
        },
        metadata: {
          city: city,
          area: area,
        },
      });
      return shippingRate;
    } catch (err) {
      throw new ApiError(
        `Failed to create Stripe shipping rate: ${err.message}`,
        500,
      );
    }
  }

  static async getShippingRate(stripeShippingRateId) {
    try {
      const shippingRate =
        await stripe.shippingRates.retrieve(stripeShippingRateId);
      return shippingRate;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe shipping rate: ${err.message}`,
        500,
      );
    }
  }

  static async archiveShippingRate(stripeShippingRateId) {
    try {
      const archivedRate = await stripe.shippingRates.update(
        stripeShippingRateId,
        {
          active: false,
        },
      );
      return archivedRate;
    } catch (err) {
      throw new ApiError(
        `Failed to archive Stripe shipping rate: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripeShippingRate;
