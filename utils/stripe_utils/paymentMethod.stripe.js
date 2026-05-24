const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");

class stripePaymentMethod {
  static async createPaymentMethod(type, cardDetails, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: type,
        card: cardDetails,
        customer: customerId,
      });
      return paymentMethod;
    } catch (err) {
      throw new ApiError(
        `Failed to create Stripe payment method: ${err.message}`,
        500,
      );
    }
  }

  static async retrievePaymentMethod(id) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(id);
      if (!paymentMethod) {
        throw new ApiError("Payment method not found", 404);
      }
      return paymentMethod;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe payment method: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripePaymentMethod;
