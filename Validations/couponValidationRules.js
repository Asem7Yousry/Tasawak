const { check } = require("express-validator");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");

// middle ware rules for validation of Coupon//

exports.getSpecificCouponValidator = [
  check("couponID").isMongoId().withMessage("not Valid Mongo Id for coupon"),
  validatorMiddleWare,
];

exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage("name only accepts letters")
    .isLength({ min: 3 })
    .withMessage("name can't be less than 3")
    .isLength({ max: 15 })
    .withMessage("name can't be more than 15"),
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
