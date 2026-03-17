const express = require("express");
const CopServ = require("../controllers/coupon.controller");
const couponValidation = require("../Validations/couponValidationRules");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for listing all brands and creating new brand
router
  .route("/")
  .get(CopServ.getAllCoupons)
  .post(
    adminGuard,
    couponValidation.createCouponValidator,
    CopServ.createCoupon,
  )
  .delete(
    adminGuard,
    couponValidation.getSpecificCouponValidator,
    CopServ.deleteAllCoupon,
  );

// @desc routes for get ,update and delete specific brand by id
router
  .route("/:couponID")
  .get(couponValidation.getSpecificCouponValidator, CopServ.getSpecificCoupon)
  .put(
    adminGuard,
    couponValidation.getSpecificCouponValidator,
    CopServ.updateSpecificCoupon,
  )
  .delete(
    adminGuard,
    couponValidation.getSpecificCouponValidator,
    CopServ.deleteSpecificCoupon,
  );

module.exports = router;
