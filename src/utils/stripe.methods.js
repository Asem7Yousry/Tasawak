const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order.Model");
const { Product, productVariation } = require("../models/productModel");
const { getCache, delCache } = require("./redis.methods");
const cartServ = require("../services/cart.service");
const userServ = require("../services/user.service");
const ApiError = require("./apiError");

// create a paymentIntent with Stripe API
// exports.createPaymentIntent = async (data) => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: data.totalAmount * 100,
//     currency: data.currency,
//     automatic_payment_methods: { enabled: true },
//     metadata: { orderId: data.orderId, isDelivered: false },
//   });
//   return paymentIntent;
// };

// success payment handler for Stripe payment
// exports.handlePaymentSuccess = async (object) => {
//   try {
//     // check if payment intent comes from subscription
//     if (
//       String(object?.description).toLocaleLowerCase().includes("subscription")
//     ) {
//       return true;
//     }
//     const orderId = object?.client_reference_id || object.metadata.orderId;
//     let order = await Order.findByIdAndUpdate(
//       orderId,
//       {
//         isPaid: true,
//         paidAt: new Date(),
//         status: "shipping",
//         paymentId: object.id,
//       },
//       { new: true },
//     );
//     await cartServ.deleteCart(order.userId.toString());
//   } catch (err) {
//     console.log("Error handling payment success:", err);
//     throw new ApiError(`Failed to handle payment success: ${err.message}`, 500);
//   }
// };

// Create a Stripe Checkout session
// exports.createCheckoutSession = async (req, data) => {
//   const frontendUrl =
//     process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
//   const successUrlPath = process.env.CHECKOUT_SUCCESS_PATH || "/api/order";
//   const cancelUrlPath = process.env.CHECKOUT_CANCEL_PATH || "/api/cart/my-cart";
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: data.line_items,
//     mode: "payment",
//     success_url: `${frontendUrl}${successUrlPath}?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${frontendUrl}${cancelUrlPath}`,
//     client_reference_id: data.orderId,
//     customer_email: req.user.email,
//     shipping_options: [{ shipping_rate: data.shippingId }],
//     // meta data saved in payment transaction in Stripe dashboard
//     payment_intent_data: {
//       metadata: { orderId: data.orderId, isDelivered: false },
//     },
//   });
//   return session;
// };

// exports.handleEventType = async (event, req) => {
//   const { type, data } = event;
//   const object = data.object;

//   switch (type) {
//     case "payment_intent.succeeded": {
//       await this.handlePaymentSuccess(object);
//       break;
//     }
//     case "customer.subscription.created": {
//       console.log("Subscription created:", object.id);
//       await this.handleSubscriptionEvent(req, object);
//       break;
//     }
//     default:
//       console.log(`Unhandled event type: ${type}`);
//       break;
//   }
// };

// webhook handler for Stripe events (e.g., payment success)
// exports.webhookCheckout = async (req, res, next) => {
//   // check if signing secret is configured
//   const SigningSecret =
//     process.env.SIGNING_SECRET || process.env.LOCAL_SIGNING_SECRET;
//   let event;
//   if (SigningSecret) {
//     // check the signature sent by Stripe for authentication
//     const signature = req.headers["stripe-signature"];
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         signature,
//         SigningSecret,
//       );
//     } catch (err) {
//       console.log(`⚠️ Webhook signature verification failed.`, err.message);
//       return res
//         .status(400)
//         .json({ error: "Webhook signature verification failed." });
//     }
//     // Handle the event based on type
//     await this.handleEventType(event, req);
//     return res.status(200).json({ received: true });
//   }
// };

//// for shipping rates management ////
// exports.createShippingRate = async (city, area, cost, currency) => {
//   try {
//     const shippingRate = await stripe.shippingRates.create({
//       display_name: `${city} - ${area}`,
//       type: "fixed_amount",
//       fixed_amount: {
//         amount: cost * 100,
//         currency: currency || "egp",
//       },
//       metadata: {
//         city: city,
//         area: area,
//       },
//     });
//     return shippingRate;
//   } catch (err) {
//     console.log(err);
//     throw new ApiError(
//       `Failed to create Stripe shipping rate: ${err.message}`,
//       500,
//     );
//   }
// };

// exports.archiveShippingRate = async (stripeShippingRateId) => {
//   try {
//     const archivedRate = await stripe.shippingRates.update(
//       stripeShippingRateId,
//       {
//         active: false,
//       },
//     );
//     return archivedRate;
//   } catch (err) {
//     throw new ApiError(
//       `Failed to archive Stripe shipping rate: ${err.message}`,
//       500,
//     );
//   }
// };

// exports.refundPayment = async (paymentId, amount) => {
//   try {
//     const refund = await stripe.refunds.create({
//       payment_intent: paymentId,
//       amount: amount * 100, // Stripe expects amount in cents
//     });
//     return refund;
//   } catch (err) {
//     throw new ApiError(`Failed to refund payment: ${err.message}`, 500);
//   }
// };

// exports.refundAllPayment = async () => {
//   try {
//     for await (const payment of stripe.paymentIntents.list({
//       limit: 100,
//       expand: ["data.latest_charge"],
//     })) {
//       if (
//         payment.latest_charge?.amount_refunded <
//           payment.latest_charge?.amount &&
//         payment.metadata?.isDelivered == "false"
//       ) {
//         await this.refundPayment(
//           payment.id,
//           payment.latest_charge?.amount / 100,
//         );
//       }
//     }
//   } catch (error) {
//     throw new ApiError(`Failed to refund payment: ${error.message}`, 500);
//   }
// };

/// for subscription management ///
// exports.createCustomer = async (req) => {
//   try {
//     const customer = await stripe.customers.create({
//       email: req.user.email,
//       name: `${req.user.fullName.first_name} ${req.user.fullName.last_name}`,
//       metadata: { userId: req.user._id.toString() },
//     });
//     await userServ.setUserSubscriptionData(req.user._id, {
//       stripeCustomerId: customer.id,
//     });
//     return customer;
//   } catch (err) {
//     throw new ApiError(`Failed to create Stripe customer: ${err.message}`, 500);
//   }
// };

// exports.createProduct = async (name, description) => {
//   try {
//     const product = await stripe.products.create({
//       name: name,
//       description: description,
//     });
//     return product;
//   } catch (err) {
//     throw new ApiError(`Failed to create Stripe product: ${err.message}`, 500);
//   }
// };

// exports.createPrice = async (
//   productId,
//   unitAmount,
//   currency,
//   interval,
//   interval_count,
// ) => {
//   try {
//     const priceData = {
//       product: productId,
//       unit_amount: unitAmount * 100,
//       currency: currency || "egp",
//     };
//     // Add recurring only if interval exists
//     if (interval) {
//       priceData.recurring = {
//         interval,
//         interval_count: interval_count || 1,
//       };
//     }
//     const price = await stripe.prices.create(priceData);
//     return price;
//   } catch (err) {
//     throw new ApiError(`Failed to create Stripe price: ${err.message}`, 500);
//   }
// };

// exports.archivePrice = async (stripePriceId) => {
//   try {
//     const archivedPrice = await stripe.prices.update(stripePriceId, {
//       active: false,
//     });
//     return archivedPrice;
//   } catch (err) {
//     throw new ApiError(`Failed to archive Stripe price: ${err.message}`, 500);
//   }
// };

// exports.archiveProduct = async (stripeProductId) => {
//   try {
//     const archivedProduct = await stripe.products.update(stripeProductId, {
//       active: false,
//     });
//     return archivedProduct;
//   } catch (err) {
//     throw new ApiError(`Failed to archive Stripe product: ${err.message}`, 500);
//   }
// };

// exports.updateProduct = async (stripeProductId, updateData) => {
//   await stripe.products.update(stripeProductId, updateData);
// };

// exports.getPrice = async (stripePriceId) => {
//   try {
//     const price = await stripe.prices.retrieve(stripePriceId);
//     return price;
//   } catch (err) {
//     throw new ApiError(`Failed to retrieve Stripe price: ${err.message}`, 500);
//   }
// };

exports.createSubscription = async (req, priceId) => {
  const frontendUrl =
    process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
  const successUrlPath = process.env.CHECKOUT_SUCCESS_PATH || "/api/order";
  const cancelUrlPath = process.env.CHECKOUT_CANCEL_PATH || "/api/cart/my-cart";
  console.log("customer Id", req.user.stripeCustomerId);
  const customerId =
    req.user.subscription?.stripeCustomerId ||
    (await this.createCustomer(req)).id;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}${successUrlPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}${cancelUrlPath}`,
    customer: customerId,
    subscription_data: {
      metadata: { userId: req.user._id.toString() },
    },
  });
  return session;
};

exports.handleSubscriptionEvent = async (req, object) => {
  console.log("Handling subscription event for subscription ID:", object.id);
  // req.user.stripeSubscriptionId = object.id;
  // await req.user.save();
};

exports.test = async (paymentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
  // console.log("paymentIntent:");
  // console.log(paymentIntent);
  const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
  console.log("charge:");
  console.log(charge);
  // return paymentIntent;
};
