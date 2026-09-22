const ApiError = require("./apiError");

// calculate price after discount based on type of coupon
exports.calcDiscountedPrice = (cart, coupon) => {
  if (coupon.minOrderValue && cart.subtotal < coupon.minOrderValue) {
    throw new ApiError(
      `coupon works in total price above ${coupon.minOrderValue}`,
    );
  }
  if (coupon.type === "percentage") {
    let discountedPrice = Number(
      (cart.totalPrice - (cart.totalPrice * coupon.discount) / 100).toFixed(2),
    );
    cart.totalAfterDiscount = discountedPrice;
  }
  if (coupon.type === "fixed") {
    let discountedPrice = Number(
      (cart.totalPrice - coupon.discount).toFixed(2),
    );
    cart.totalAfterDiscount = discountedPrice;
  }
  cart.couponId = coupon._id;
  cart.couponCode = coupon.code;
  cart.discountType = coupon.type;
  cart.couponDiscount = coupon.discount;
  cart.discountAmount = Number(
    (cart.totalPrice - cart.totalAfterDiscount).toFixed(2),
  );
  return cart;
};
