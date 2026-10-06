const { check } = require("express-validator");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");
const catServ = require("../services/category.service");
const ApiError = require("../utils/apiError");

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
    .isLength({ min: 3 })
    .withMessage("title can't be less than 3")
    .isLength({ max: 15 })
    .withMessage("title can't be more than 15"),
  check("parentCategoryId")
    .optional()
    .isMongoId()
    .withMessage("not Valid Mongo Id for parent category")
    .custom(async (parentCategoryId) => {
      if (parentCategoryId) {
        const category = await catServ.getById(parentCategoryId);
        if (!category) {
          throw new ApiError(`parent category not found with id:${parentCategoryId}`, 404);
        }
      }
    }),
  validatorMiddleWare,
];
