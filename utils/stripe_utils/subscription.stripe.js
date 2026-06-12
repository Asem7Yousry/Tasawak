const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");
const stripeCustomer = require("./customer.stripe");
const stripeInvoice = require("./invoices.stripe");
const userServices = require("../../services/user.service");

class StripeSubscription {
  static async createSubscriptionSession(req, priceId, planId, costId) {
    try {
      // enhance redirect urls with environment variables
      const frontendUrl =
        process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
      const successUrlPath = process.env.CHECKOUT_SUCCESS_PATH || "/api/order";
      const cancelUrlPath =
        process.env.CHECKOUT_CANCEL_PATH || "/api/cart/my-cart";
      // Get or create the Stripe customer
      const customerId =
        req.user?.subscription?.stripeCustomerId ||
        (await stripeCustomer.createCustomer(req)).id;
      // Create the subscription
      const Subscription = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${frontendUrl}${successUrlPath}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}${cancelUrlPath}`,
        subscription_data: {
          metadata: {
            userId: req.user._id.toString(),
            userEmail: req.user.email,
            userName: `${req.user.fullName.first_name} ${req.user.fullName.last_name}`,
            userPhone: req.user.phoneNumber || "",
            planId,
            costId,
          },
        },
      });
      return Subscription;
    } catch (error) {
      throw new ApiError("Failed to create subscription" + error.message, 500);
    }
  }

  static async createSubscription(
    customerId,
    priceId,
    paymentMethodId,
    options = {},
  ) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      trial_period_days: options?.trialDays || 0,
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.confirmation_secret"],
      metadata: options.metadata || {},
    });
    if (subscription.status === "incomplete") {
      const invoice = subscription.latest_invoice;
      const clientSecret = invoice?.confirmation_secret?.client_secret ?? null;

      return {
        subscriptionId: subscription.id,
        clientSecret,
        requiresAction: !!clientSecret,
      };
    }

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      requiresAction: false,
    };
  }

  static async retrieveSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!subscription) {
        throw new ApiError("Stripe subscription not found", 404);
      }
      return subscription;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe subscription: ${err.message}`,
        500,
      );
    }
  }

  static async cancelSubscription(subscriptionId) {}

}

module.exports = StripeSubscription;
