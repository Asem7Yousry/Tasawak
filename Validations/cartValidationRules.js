const { check } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");
const ApiError = require("../utils/apiError");
const { cacheRedis, getCache } = require("../utils/redis.methods");

exports.addCartItemOrQuantity = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("not valid mongo ID for product")
    .custom(async (val, { req }) => {
      const key = `product_${val}`;
      // check if product exists in cache first
      let myProduct = await getCache(key);
      if (!myProduct) {
        // get product from DB IF Not cached
        const Product = mongoose.model("Products");
        myProduct = await Product.findById(val).lean();
        if (!myProduct) {
          return Promise.reject(
            new ApiError(`no product found with id: ${val}`, 404),
          );
        }
        let { createdAt, updatedAt, slug, __v, ...restProduct } = myProduct;
        myProduct = restProduct;
        await cacheRedis(
          key,
          myProduct,
          Number(process.env.Redis_Expriation_Time),
        );
      } else {
        myProduct = JSON.parse(myProduct);
      }
      // Attach to request
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
