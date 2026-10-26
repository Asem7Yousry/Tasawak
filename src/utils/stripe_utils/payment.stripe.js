const stripe = require("../../config/stripe.config");
const ApiError = require("../apiError");
const { publishOrderEvent } = require("../../producers/order.producer")

class stripePayment {
  static async createPaymentIntent(data) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.totalAmount * 100,
      currency: data.currency || "egp",
      automatic_payment_methods: { enabled: true },
      metadata: { isDelivered: false, orderId: data.orderId, email: data.email },
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
      metadata: { orderId: data.orderId },
      customer_email: req.user.email,
      // shipping_options: [{ shipping_rate: data.shippingId }],
      payment_intent_data: {
        metadata: { orderId: data.orderId, isDelivered: false, email: req.user.email },
      },
      // Stripe expects discounts to be an array. The coupon value must be a
      // Stripe Coupon ID; a MongoDB coupon _id is not valid.
      ...(data?.stripeCouponId
        ? { discounts: [{ coupon: data.stripeCouponId }] }
        : {}),
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
      const orderId = object?.client_reference_id || object?.metadata?.orderId;
      let userEmail = object.metadata.email;
      if (!orderId || !userEmail) throw new Error("Payment is missing its order reference ID or user email");
      await publishOrderEvent("payment.success", { orderId, provider: "stripe", paymentId: object.id });
    } catch (err) {
      throw new ApiError(
        `Failed to handle payment success: ${err.message}`,
        500,
      );
    }
  }

  static async handlePaymentFailed(object) {
    try {
      const orderId = object?.client_reference_id || object?.metadata?.orderId;
      if (!orderId) throw new Error("Payment is missing its order reference");
      await publishOrderEvent("payment.failed", { orderId, provider: "stripe", paymentId: object.id });
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

  static buildStripeLineItems(items, currency = "egp") {
    if (!items || typeof items !== "object" || Array.isArray(items)) {
      throw new ApiError("Cart items are invalid for Stripe Checkout", 400);
    }

    const lineItems = Object.values(items).map((item) => {
      const quantity = Number(item.quantity);
      const unitAmount = Math.round(Number(item.piecePrice) * 100);
      const productName = String(item.productName || "Product").trim();
      const attribute = item.attribute;
      const description = attribute && typeof attribute === "object"
        ? Object.entries(attribute).map(([key, value]) => `${key}: ${value}`).join(", ")
        : attribute ? String(attribute) : undefined;

      if (!Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(unitAmount) || unitAmount < 1) {
        throw new ApiError(`Invalid quantity or price for ${productName}`, 400);
      }

      return {
        quantity,
        price_data: {
          currency: String(currency).toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: productName,
            ...(description ? { description } : {}),
            metadata: {
              productId: String(item.productId || ""),
              variationId: String(item.variationId || ""),
            },
          },
        },
      };
    });

    if (!lineItems.length) {
      throw new ApiError("Cannot create a Stripe Checkout Session with an empty cart", 400);
    }
    return lineItems;
  }
}

module.exports = stripePayment;
