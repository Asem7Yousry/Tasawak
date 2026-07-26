const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../apiError");
const Order = require("../../models/order.Model");
const cartServ = require("../../services/cart.service");

class stripePayment {
  static async createPaymentIntent(data) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.totalAmount * 100,
      currency: data.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: data.orderId, isDelivered: false },
    });
    return paymentIntent;
  }

  static async createCheckoutSession(req, data) {
    const frontendUrl =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const successUrlPath = process.env.CHECKOUT_SUCCESS_PATH || "/api/order";
    const cancelUrlPath =
      process.env.CHECKOUT_CANCEL_PATH || "/api/cart/my-cart";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data.line_items,
      mode: "payment",
      success_url: `${frontendUrl}${successUrlPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}${cancelUrlPath}`,
      client_reference_id: data.orderId,
      customer_email: req.user.email,
      shipping_options: [{ shipping_rate: data.shippingId }],
      payment_intent_data: {
        metadata: { orderId: data.orderId, isDelivered: false },
      },
      discounts: {
        coupon: data?.couponId,
      },
    });
    return session;
  }

  static async handlePaymentSuccess(object) {
    try {
      // check if payment intent comes from subscription
      if (
        String(object?.description).toLocaleLowerCase().includes("subscription")
      ) {
        return true;
      }
      const orderId = object?.client_reference_id || object.metadata.orderId;
      let order = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paidAt: new Date(),
          status: "shipping",
          paymentId: object.id,
        },
        { new: true },
      );
      await cartServ.deleteCart(order.userId.toString());
    } catch (err) {
      throw new ApiError(
        `Failed to handle payment success: ${err.message}`,
        500,
      );
    }
  }

  static async handlePaymentFailed(object) {
    try {
      const orderId = object?.client_reference_id || object.metadata.orderId;
      // send email there to notify user about failed payment
    } catch (err) {
      throw new ApiError(
        `Failed to handle payment failure: ${err.message}`,
        500,
      );
    }
  }

  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve payment intent: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripePayment;
