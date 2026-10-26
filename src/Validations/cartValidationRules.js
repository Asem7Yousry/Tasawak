const { check } = require("express-validator");
const prodServ = require("../services/product.service");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");
const ApiError = require("../utils/apiError");

exports.addCartItemOrQuantity = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("not valid mongo ID for product")
    .custom(async (val, { req }) => {
      let myProduct = await prodServ.getById(val);
      if (!myProduct)
        return new ApiError(`product with id ${val} not exists`, 404);
      req.product = myProduct;
      return true;
    }),
  check("quantity")
    .optional()
    .isInt()
    .withMessage("quantity must be integer")
    .custom((val) => {
      if (val <= 0) {
        return Promise.reject(new ApiError(`quantity must be at least 1`, 400));
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.removeCartItemVal = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("not valid mongo ID for product"),
  validatorMiddleWare,
];

exports.changeCartItemQuantity = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("not valid mongo ID for product")
    .custom(async (val, { req }) => {
      let myProduct = await prodServ.getById(val);
      if (!myProduct)
        return new ApiError(`product with id ${val} not exists`, 404);
      req.product = myProduct;
      return true;
    }),
  check("quantity")
    .notEmpty()
    .withMessage("quantity required")
    .isInt()
    .withMessage("quantity must be integer")
    .custom((val) => {
      if (val <= 0) {
        return Promise.reject(new ApiError(`quantity must be at least 1`, 400));
      }
      return true;
    }),
  validatorMiddleWare,
];
