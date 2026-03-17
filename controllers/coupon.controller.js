const factory = require("./factoryHandler");
const couponServices = require("../services/coupon.service");

// @doc create new Coupon
// @route Post /api/coupon
// @access private
exports.createCoupon = factory.createDoc(couponServices);

// @doc get all Coupons
// @route Get /api/coupon
// @access public
exports.getAllCoupons = factory.getAllDoc(couponServices, "Coupon");

// @doc get specific Coupon by ID
// @route Get /api/coupon/:couponID
// @access public
exports.getSpecificCoupon = factory.getSpecificDoc(
  couponServices,
  "Coupon",
  "couponID",
);

// @doc update specific Coupon by ID
// @route put /api/coupon/:couponID
// @access private
exports.updateSpecificCoupon = factory.updateSpecificDoc(
  couponServices,
  "Coupon",
  "couponID",
);

// @doc delete specific Coupon by ID
// @route delete /api/coupon/:couponID
// @access private
exports.deleteSpecificCoupon = factory.deleteSpecificDoc(
  couponServices,
  "Coupon",
  "couponID",
);

// @doc delete specific Coupon by ID
// @route delete /api/coupon/:couponID
// @access private
exports.deleteAllCoupon = factory.deleteAllDocs(couponServices, "Coupon");
