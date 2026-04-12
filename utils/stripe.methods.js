const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a Stripe Checkout session
exports.createCheckoutSession = async (data, req) => {
  const session = await stripe.checkout.sessions.create({
    // line_items: lineItems,
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: data.name,
          },
          unit_amount: data.totalPrice * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/cart/my-cart`,
    customer_email: data.email, // Optional: pre-fill the customer's email
    client_reference_id: data.cartId, // Optional: attach order ID for later reference
    // metadata: {
    //   shippingAddress: data.shippingAddress, // Optional: attach shipping address for later reference
    // },
  });
  return session;
};

// webhook handler for Stripe events (e.g., payment success)
exports.webhookCheckout = async (req, res, next) => {
  // debug 
  console.log("Stripe SIGNING_SECRET:", process.env.SIGNING_SECRET);
  console.log("Stripe req headers:", req.headers);
  console.log("Received Stripe webhook event:", req.body);
  let event;
  if (process.env.SIGNING_SECRET) {
    // Get the signature sent by Stripe
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.SIGNING_SECRET,
      );
      return res.status(200).json({ received: true });
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }
};
