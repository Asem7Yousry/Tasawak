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
}

module.exports = stripeCustomer;
