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

// @doc apply coupon on user cart
// @route put /api/cart/apply-coupon
// @access private
exports.applyCoupon = async (req, res) => {
  const cart = await couponServices.applyCouponServ(
    req.body.couponCode,
    req.user._id,
  );
  res.status(201).json({
    success: true,
    message: "coupon applied",
    data: { cart },
  });
};

// @doc remove coupon from user cart
// @route delete /api/cart/remove-coupon
// @access private
exports.removeCoupon = async (req, res) => {
  const cart = await couponServices.removeCouponServ(req.user._id);
  res.status(201).json({
    success: true,
    message: "coupon removed",
    data: { cart },
  });
};
