const Coupon = require("../models/coupon.model");
const cartServ = require("./cart.service");
const { QueryListing } = require("../utils/queryListing");
const { cacheRedis, getCache } = require("../utils/redis.methods");
const { calcDiscountedPrice } = require("../utils/calculate.discount");
const { saveCartJob } = require("../utils/queues");
const ApiError = require("../utils/apiError");

// create Coupon
exports.create = (req) => Coupon.create(req.body);

// list all Coupons
exports.list = (req) => {
  return QueryListing(Coupon, req.query);
};

// get specific Coupon by id
exports.getById = (id) => Coupon.findById(id);

// get specific Coupon by code
exports.getByCode = async (code) => {
  let coupon = await getCache(`coupon_${code}`);
  // Check if cached coupon is still valid (not expired)
  if (coupon && new Date(coupon.expireAt) > new Date() && coupon.isActive) {
    return coupon;
  }
  // If expired or inactive, remove from cache and fetch fresh
  coupon = await Coupon.findOne({
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
};

exports.updateById = (id, updates) =>
  Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Coupon.deleteMany({});

exports.deleteById = (id) => Coupon.findByIdAndDelete(id);

// apply coupon on cart
exports.applyCouponServ = async (couponCode, userId) => {
  // check if coupon valid or not
  const coupon = await this.getByCode(couponCode);
  let cart = await cartServ.getCart(userId);
  if (!cart || Object.values(cart.items).length === 0) {
    throw new ApiError("no cart found", 404);
  }
  cart.coupon = coupon.code;
  let returnedCart = { ...cart };
  const discountedPrice = calcDiscountedPrice(cart.totalPrice, coupon);
  returnedCart.priceAfterDiscount = discountedPrice;

  // override cart and background job
  cacheRedis(`cart_${userId}`, cart);
  await saveCartJob(userId);

  return returnedCart;
};
