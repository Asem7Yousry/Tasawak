const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../apiError");

class stripeInvoice {
  static async retrieveInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ["confirmation_secret"],
      });
      if (!invoice) {
        throw new ApiError("Stripe invoice not found", 404);
      }
      return invoice;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe invoice: ${err.message}`,
        500,
      );
    }
  }

  static async invoiceSucceeded(object) {
    try {
      const subscriptionId = object.parent.subscription_details?.subscription;
      const metadata = object.parent.subscription_details?.metadata;
      const user = await userServices.setUserSubscriptionData(metadata.userId, {
        stripeSubscriptionId: subscriptionId,
        planId: metadata.planId,
        costId: metadata.costId,
        stripeCustomerId: object.customer,
      });
    } catch (error) {
      throw new ApiError(
        "Failed to set user subscription data: " + error.message,
        500,
      );
    }
  }

  static async invoicePaymentFailed(object) {
    try {
      console.log("Handling invoice payment failure for subscription:", object);
    } catch (error) {
      throw new ApiError(
        "Failed to clear user subscription data: " + error.message,
        500,
      );
    }
  }
}

module.exports = stripeInvoice;
