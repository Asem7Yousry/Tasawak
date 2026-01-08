const { check } = require("express-validator");
const validatorMiddleWare = require("../../middlewares/ValidatorMiddleWareMethod");

// middle ware rules for validation of Category//

exports.getSpecificCategoryValidator = [
  check("categoryID")
    .isMongoId()
    .withMessage("not Valid Mongo Id for category"),
  validatorMiddleWare,
];

exports.createCategoryValidator = [
  check("title")
    .notEmpty()
    .withMessage("title is required")
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage("title only accepts letters")
    .isLength({min:3})
    .withMessage("title can't be less than 3")
    .isLength({max:15})
    .withMessage("title can't be more than 15"),
  validatorMiddleWare,
];
