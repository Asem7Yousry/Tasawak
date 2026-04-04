const ApiError = require("../utils/apiError");

// calculate price after discount based on type of coupon
exports.calcDiscountedPrice = (totalPrice, coupon) => {
  if (coupon.minOrderValue && totalPrice < coupon.minOrderValue) {
    throw new ApiError(
      `coupon works in total price above ${coupon.minOrderValue}`,
    );
  }
  if (coupon.type === "percentage") {
    return Number(
      (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2),
    );
  }
  if (coupon.type === "fixed") {
    return Number((totalPrice - coupon.discount).toFixed(2));
  }
};
