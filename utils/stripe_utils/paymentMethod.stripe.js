const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");

class stripePaymentMethod {
  static async createPaymentMethod(type, cardDetails, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: type,
        // card: cardDetails,
        card: {
          token: cardDetails.token, // ← use token, not raw numbers
        },
      });
      // attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
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

  // delete payment method from customer
  static async detachPaymentMethod(id) {
    try {
      await stripe.paymentMethods.detach(id);
    } catch (err) {
      throw new ApiError(
        `Failed to detach Stripe payment method: ${err.message}`,
        500,
      );
    }
  }

  // list all payment methods of a customer
  static async listCustomerPaymentMethods(stripeCustomerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
      });
      return paymentMethods;
    } catch (err) {
      throw new ApiError(
        `Failed to list Stripe payment methods: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripePaymentMethod;
