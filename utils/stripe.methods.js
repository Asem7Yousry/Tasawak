const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order.Model");
const { Product, productVariation } = require("../models/productModel");
const { getCache, delCache } = require("./redis.methods");
const cartServ = require("../services/cart.service");
const ApiError = require("./ApiError");

// create a paymentIntent with Stripe API
exports.createPaymentIntent = async (data) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.totalAmount * 100,
    currency: data.currency,
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: data.orderId, isDelivered: false },
  });
  return paymentIntent;
};

// success payment handler for Stripe payment
exports.handlePaymentSuccess = async (object) => {
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
};

// Create a Stripe Checkout session
exports.createCheckoutSession = async (data, req) => {
  const frontendUrl =
    process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
  const successUrlPath = process.env.CHECKOUT_SUCCESS_PATH || "/api/order";
  const cancelUrlPath = process.env.CHECKOUT_CANCEL_PATH || "/api/cart/my-cart";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: data.line_items,
    mode: "payment",
    success_url: `${frontendUrl}${successUrlPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}${cancelUrlPath}`,
    client_reference_id: data.orderId,
    customer_email: req.user.email,
    shipping_options: [{ shipping_rate: data.shippingId }],
    // meta data saved in payment transaction in Stripe dashboard
    payment_intent_data: {
      metadata: { orderId: data.orderId, isDelivered: false },
    },
  });
  return session;
};

exports.handleEventType = async (event) => {
  const { type, data } = event;
  const object = data.object;

  switch (type) {
    case "payment_intent.succeeded": {
      await this.handlePaymentSuccess(object);
      break;
    }
    default:
      console.log(`Unhandled event type: ${type}`);
      break;
  }
};

// webhook handler for Stripe events (e.g., payment success)
exports.webhookCheckout = async (req, res, next) => {
  // check if signing secret is configured
  const SigningSecret =
    process.env.SIGNING_SECRET || process.env.LOCAL_SIGNING_SECRET;
  let event;
  if (SigningSecret) {
    // check the signature sent by Stripe for authentication
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        SigningSecret,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res
        .status(400)
        .json({ error: "Webhook signature verification failed." });
    }
    // Handle the event based on type
    await this.handleEventType(event);
    return res.status(200).json({ received: true });
  }
};

//// for shipping rates management ////
exports.createShippingRate = async (city, area, cost, currency) => {
  try {
    const shippingRate = await stripe.shippingRates.create({
      display_name: `${city} - ${area}`,
      type: "fixed_amount",
      fixed_amount: {
        amount: cost * 100,
        currency: currency || "egp",
      },
      metadata: {
        city: city,
        area: area,
      },
    });
    return shippingRate;
  } catch (err) {
    console.log(err);
    throw new ApiError(
      `Failed to create Stripe shipping rate: ${err.message}`,
      500,
    );
  }
};

exports.archiveShippingRate = async (stripeShippingRateId) => {
  try {
    const archivedRate = await stripe.shippingRates.update(
      stripeShippingRateId,
      {
        active: false,
      },
    );
    return archivedRate;
  } catch (err) {
    throw new ApiError(
      `Failed to archive Stripe shipping rate: ${err.message}`,
      500,
    );
  }
};
