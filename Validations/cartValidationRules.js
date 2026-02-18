const { check } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");
const ApiError = require("../utils/apiError");
const redisClient = require("../config/redis.config");

exports.addCartItemOrQuantity = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("not valid mongo ID for product")
    .custom(async (val, { req }) => {
      let myProduct;
      const cachedProduct = await redisClient.get(`product_${val}`);
      if (cachedProduct) {
        myProduct = JSON.parse(cachedProduct);
      } else {
        let Product = mongoose.model("Products");
        myProduct = await Product.findById(val).lean();
        if (!myProduct) {
          return Promise.reject(
            new ApiError(`no product found with id: ${val}`, 404),
          );
        }
        // enhance the needed data from product to be cached 
        let { _id, name, price, quantity, ...rest } = myProduct;
        myProduct = { _id, name, price, quantity}
        await redisClient.setEx(
          `product_${val}`,
          process.env.Redis_Expriation_Time,
          JSON.stringify(myProduct),
        );
      }
      req.product = myProduct;
      return true;
    }),
  check("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt()
    .withMessage("quantity must be integer")
    .custom((val, { req }) => {
      if (val <= 0) {
        return Promise.reject(
          new ApiError(`quantity must be more than or equal 1`, 400),
        );
      } else if (val > req.product.quantity) {
        return Promise.reject(
          new ApiError(
            `quantity must be less than or equal ${req.product.quantity}`,
            400,
          ),
        );
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
