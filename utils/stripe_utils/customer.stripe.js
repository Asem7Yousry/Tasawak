const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userServ = require("../../services/user.service");
const ApiError = require("../ApiError");

class stripeCustomer {
  static async createCustomer(req) {
    try {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.fullName.first_name} ${req.user.fullName.last_name}`,
        metadata: { userId: req.user._id.toString() },
      });
      console.log("Stripe customer created:", customer.id);
      await userServ.setUserSubscriptionData(req.user._id, {
        stripeCustomerId: customer.id,
      });
      return customer;
    } catch (err) {
      throw new ApiError(
        `Failed to create Stripe customer: ${err.message}`,
        500,
      );
    }
  }

  static async retrieveCustomer(stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (!customer) {
        throw new ApiError("Stripe customer not found", 404);
      }
      return customer;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe customer: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripeCustomer;
