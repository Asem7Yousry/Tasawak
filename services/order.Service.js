const Order = require("../models/order.Model");
const { getCache, cacheRedis, delCache } = require("../utils/redis.methods");
const ApiError = require("../utils/apiError");
const cartServ = require("./cart.service");
const prodServ = require("./product.service");
const variationServ = require("./product.variations.services");
const couponServ = require("./coupon.service");
const { calcDiscountedPrice } = require("../utils/calculate.discount");
const asyncHandler = require("express-async-handler");

// create order with cash payment method
exports.cashOrder = async (userId) => {
  // get cart items
  const cart = await cartServ.getCart(userId);
  if (!cart || Object.values(cart.items).length === 0) {
    throw new ApiError("no cart found", 404);
  }
  const orderItems = [];
  let totalPrice = 0;
  // map cart items to order items and check if the quantity of each item is available or not
  for (const key of Object.keys(cart.items)) {
    const item = cart.items[key];
    const [productId, variationId] = key.split("_");
    const product = await prodServ.getById(productId);
    const Variation = product.variations[variationId];
    if (Variation && item.quantity <= Variation.quantity) {
      orderItems.push({
        productId: productId,
        variationId: variationId,
        price: Variation.peacePrice,
        quantity: item.quantity,
      });
      totalPrice += item.quantity * Variation.peacePrice;
    } else {
      throw new ApiError(
        `quantity of variation ${variationId} not available`,
        403,
      );
    }
  }
  // apply coupon if exist
  let couponCode = cart.coupon;
  if (couponCode) {
    couponCode = await couponServ.getByCode(couponCode);
    if (couponCode) {
      totalPrice = calcDiscountedPrice(cart.totalPrice, couponCode);
    }
  }
  // create order
  const order = await Order.create({
    userId,
    cartItems: orderItems,
    couponApllied: couponCode ? couponCode._id : null,
    couponDiscount: couponCode ? couponCode.discount : null,
    totalPrice,
  });
  // override product variation quantities
  // for (const item of orderItems) {
  //   const product = await prodServ.getById(item.productId);
  //   const variation = product.variations[item.variationId];
  //   variation.quantity -= item.quantity;
  //   await product.save();
  // }
  // delete cart from cache and database
  await cartServ.deleteCart(userId);
  return order;
};
