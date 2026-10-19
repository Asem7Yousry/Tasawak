const ApiError = require("../../utils/apiError");
const stripePayment = require("../../utils/stripe_utils/payment.stripe");
const Order = require("../../models/order.Model");
const { publishOrderCreated } = require("../../producers/order.producer");

class StripePaymentStrategy {
  async initiate({ req, cart }) {
    const paymentMethod = String(
      req.body?.paymentmethod || req.headers["paymentmethod"] || "paymentintent",
    ).toLowerCase();
    const data = {};
    const { _id, ...orderData } = cart;
    orderData.paymentProvider = "stripe";
    orderData.paymentMethod = paymentMethod;
    if (paymentMethod === "session") {
      const order = await Order.create(orderData);
      data.orderId = order._id.toString();
      data.line_items = stripePayment.buildStripeLineItems(order.items, order.currency);
      const session = await stripePayment.createCheckoutSession(req, data);
      await publishOrderCreated(order, req.user, "payment.session.created");
      return { redirect_url: session.url };
    }
    if (paymentMethod === "paymentintent") {
      const order = await Order.create(orderData);
      data.orderId = order._id.toString();
      data.email = req.user.email;
      data.totalAmount = cart.totalAfterDiscount || cart.totalPrice
      const paymentIntent = await stripePayment.createPaymentIntent(data);
      await publishOrderCreated(order, req.user, "payment.paymentintent.created");
      return {
        client_secret: paymentIntent.client_secret,
        amount: data.totalAmount
      };
    }
    throw new ApiError(`Unsupported Stripe payment mode: ${paymentMethod}`, 400);
  }
}

module.exports = StripePaymentStrategy;
