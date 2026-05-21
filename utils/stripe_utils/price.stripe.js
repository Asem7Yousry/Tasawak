const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");

class stripePrice {
  static async createPrice(
    productId,
    unitAmount,
    currency,
    interval,
    interval_count,
  ) {
    try {
      const priceData = {
        product: productId,
        unit_amount: unitAmount * 100,
        currency: currency || "egp",
      };
      // Add recurring only if interval exists
      if (interval) {
        priceData.recurring = {
          interval,
          interval_count: interval_count || 1,
        };
      }
      const price = await stripe.prices.create(priceData);
      return price;
    } catch (err) {
      throw new ApiError(`Failed to create Stripe price: ${err.message}`, 500);
    }
  }

  static async archivePrice(stripePriceId) {
    try {
      const archivedPrice = await stripe.prices.update(stripePriceId, {
        active: false,
      });
      return archivedPrice;
    } catch (err) {
      throw new ApiError(`Failed to archive Stripe price: ${err.message}`, 500);
    }
  }

  static async getPrice(stripePriceId) {
    try {
      const price = await stripe.prices.retrieve(stripePriceId);
      return price;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe price: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripePrice;
