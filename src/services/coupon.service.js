const Coupon = require("../models/coupon.model");
const { getCart, updateById } = require("./cart.service");
const { cacheRedis, getCache } = require("../utils/redis.methods");
const { calcDiscountedPrice } = require("../utils/calculate.discount");
const { publishCartSync } = require("../producers/cart.producer");
const ApiError = require("../utils/apiError");
const commonService = require("./common.service");

class couponServices extends commonService {
  // get specific Coupon by code
  async getByCode(code) {
    let coupon = await getCache(`coupon_${code}`);
    // Check if cached coupon is still valid (not expired)
    if (coupon && new Date(coupon.expireAt) > new Date() && coupon.isActive) {
      return coupon;
    }
    // If expired or inactive, remove from cache and fetch fresh
    coupon = await this.model.findOne({
      code,
      expireAt: { $gt: new Date() },
      isActive: true,
    });
    if (!coupon) {
      throw new ApiError("expired coupon", 403);
    }
    await cacheRedis(
      `coupon_${code}`,
      coupon,
      Math.floor((new Date(coupon.expireAt) - new Date()) / 1000),
    );
    return coupon;
  }

  // apply coupon on cart
  async applyCouponServ(couponCode, userId) {
    // check if coupon valid or not
    const coupon = await this.getByCode(couponCode);
    let cart = await getCart(userId);
    if (!cart || Object.values(cart.items).length === 0) {
      throw new ApiError("no cart found", 404);
    }
    cart = calcDiscountedPrice(cart, coupon);

    // override cart and background job
    cart.syncToken = Date.now().toString();
    cacheRedis(`cart_${userId}`, cart);
    await publishCartSync(userId, cart.syncToken);
    return cart;
  }

  // remove coupon from cart
  async removeCouponServ(userId) {
    let cart = await getCart(userId);
    if (!cart || Object.values(cart.items).length === 0) {
      throw new ApiError("no cart found", 404);
    }
    const cartId = cart._id;
    cart = await updateById(cartId, {
      $unset: {
        couponCode: "",
        couponDiscount: "",
        couponId: "",
        discountAmount: "",
        discountType: "",
        totalAfterDiscount: "",
      },
    });
    cart.syncToken = Date.now().toString();
    cacheRedis(`cart_${userId}`, cart);
    await publishCartSync(userId, cart.syncToken);
    return cart;
  }
}

module.exports = new couponServices(Coupon);
