const { check } = require("express-validator");
const validatorMiddleWare = require("../ValidatorMiddleWareMethod");

// validation rules for subCategories routes //

exports.subCategoryValidationRules = [
  check("categoryID")
    .notEmpty()
    .withMessage("Category ID required")
    .isMongoId()
    .withMessage("category ID must be mongoID object"),
  check("title")
    .notEmpty()
    .withMessage("title is required")
    .matches(/^[A-Za-z\u0600-\u06FF\s]+$/)
    .withMessage("title only accepts letters")
    .isLength({ min: 3 })
    .withMessage("title can't be less than 3")
    .isLength({ max: 15 })
    .withMessage("title can't be more than 15"),
  validatorMiddleWare,
];

exports.getSpecificSubCategoryValidator = [
  check("subCategoryID")
    .isMongoId()
    .withMessage("not Valid Mongo Id for subCategory"),
  validatorMiddleWare,
];
