const { check } = require("express-validator");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");

// middle ware rules for validation of Coupon//

exports.getSpecificCouponValidator = [
  check("couponID").isMongoId().withMessage("not Valid Mongo Id for coupon"),
  validatorMiddleWare,
];

const codeValidation = [
  check("code")
    .notEmpty()
    .withMessage("code is required")
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage("code only accepts letters")
    .isLength({ min: 3 })
    .withMessage("code can't be less than 3")
    .isLength({ max: 15 })
    .withMessage("code can't be more than 15"),
];

exports.createCouponValidator = [
  codeValidation,
  check("expireAt")
    .notEmpty()
    .withMessage("expiration date is required")
    .isDate()
    .withMessage("expiration must be date"),
  check("discount")
    .isNumeric()
    .withMessage("discount must be number")
    .notEmpty()
    .withMessage("discount is required"),
  validatorMiddleWare,
];

exports.applyCouponValidation = [codeValidation, validatorMiddleWare];
