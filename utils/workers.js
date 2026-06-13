const { Worker } = require("bullmq");
const redis = require("../config/redis.config");
const Cart = require("../models/cartModel");

// worker for cart saving in DB
new Worker(
  "cart-queue",
  async (job) => {
    const { userId } = job.data;
    let cart = await redis.get(`cart_${userId}`);
    if (!cart) return;
    cart = JSON.parse(cart);
    const updates = {
      items: cart.items,
      totalPrice: cart.totalPrice,
      coupon: cart.coupon,
    };
    if (cart.paymentData !== undefined) updates.paymentData = cart.paymentData;

    await Cart.findOneAndUpdate({ userId }, updates, { upsert: true });
  },
  { connection: redis },
);
