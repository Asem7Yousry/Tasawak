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
