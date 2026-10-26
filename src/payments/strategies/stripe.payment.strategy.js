const ApiError = require("../../utils/apiError");
const stripePayment = require("../../utils/stripe_utils/payment.stripe");
const Order = require("../../models/order.Model");
const { publishOrderEvent } = require("../../producers/order.producer");

class StripePaymentStrategy {
  async initiate({ req, cart }) {
    const paymentMethod = String(
      req.body?.paymentmethod || req.headers["paymentmethod"] || "paymentintent",
    ).toLowerCase();
    const data = {};
    const { _id, ...orderData } = cart;
    orderData.paymentProvider = "stripe";
    orderData.paymentMethod = paymentMethod;
    const order = await Order.create(orderData);
    const userId = req.user._id;
    const orderId = order._id.toString();
    data.orderId = orderId;
    await publishOrderEvent("order.created", { orderId, userId });
    if (paymentMethod === "session") {
      data.line_items = stripePayment.buildStripeLineItems(order.items, order.currency);
      const session = await stripePayment.createCheckoutSession(req, data);
      return { redirect_url: session.url };
    }
    if (paymentMethod === "paymentintent") {
      data.email = req.user.email;
      data.totalAmount = cart.totalAfterDiscount || cart.totalPrice
      const paymentIntent = await stripePayment.createPaymentIntent(data);
      return {
        client_secret: paymentIntent.client_secret,
        amount: data.totalAmount
      };
    }
    throw new ApiError(`Unsupported Stripe payment mode: ${paymentMethod}`, 400);
  }
}

module.exports = StripePaymentStrategy;
