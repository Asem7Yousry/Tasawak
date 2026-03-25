const ApiError = require("../utils/apiError");

// calculate price after discount based on type of coupon
exports.calcDiscountedPrice = (cart, coupon) => {
  let newCart = { ...cart };
  if (coupon.minOrderValue && newCart.totalPrice < coupon.minOrderValue) {
    throw new ApiError(
      `coupon works in total price above ${coupon.minOrderValue}`,
    );
  }
  if (coupon.type === "percentage") {
    newCart.priceAfterDiscount = Number(
      (
        newCart.totalPrice -
        (newCart.totalPrice * coupon.discount) / 100
      ).toFixed(2),
    );
    return newCart;
  }
  if (coupon.type === "fixed") {
    newCart.priceAfterDiscount = Number(
      (newCart.totalPrice - coupon.discount).toFixed(2),
    );
    return newCart;
  }
};
