const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");
const stripePayment = require("./payment.stripe");
const stripeRefund = require("./refund.stripe");
const stripeSubscription = require("./subscription.stripe");

class stripeEventHandler {
  static async checkEvent(req, res) {
    const SigningSecret =
      process.env.SIGNING_SECRET || process.env.LOCAL_SIGNING_SECRET;
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        SigningSecret,
      );
      const message = await this.handleEvent(event);
      return res.status(200).json({ received: true, message });
    } catch (err) {
      throw new ApiError(
        "Webhook signature verification failed." + err.message,
        400,
      );
    }
  }

  static async handleEvent(event) {
    console.log("Received Stripe event:", event.type);
    switch (event.type) {
      case "payment_intent.succeeded":
        // Handle successful payment intent
        await stripePayment.handlePaymentSuccess(event.data.object);
        return "Payment processed successfully.";
        break;
      case "payment_intent.payment_failed":
        // Handle failed payment intent
        await stripePayment.handlePaymentFailed(event.data.object);
        return "Payment failed.";
        break;
      case "charge.refunded":
        // Handle refunded successfully
        await stripeRefund.handleRefundSucceeded(event.data.object);
        return "Refund processed successfully.";
        break;
      case "refund.failed":
        // Handle failed refund
        await stripeRefund.handleRefundFailed(event.data.object);
        return "Refund failed.";
        break;
      case "invoice.paid":
        // Handle successful invoice payment
        await stripeSubscription.invoiceSucceeded(event.data.object);
        return "Invoice payment succeeded.";
        break;
      case "invoice.payment_failed":
        // Handle failed invoice payment
        await stripeSubscription.invoicePaymentFailed(event.data.object);
        return "Invoice payment failed.";
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return `Unhandled event type: ${event.type}`;
    }
  }
}

module.exports = stripeEventHandler;
