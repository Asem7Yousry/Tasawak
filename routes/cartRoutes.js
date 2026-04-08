const express = require("express");
const cartController = require("../controllers/cartControler");
const couponController = require("../controllers/coupon.controller");
const cartRules = require("../Validations/cartValidationRules");
const { verifyAuthentication } = require("../utils/AuthMethods");

const router = express.Router();

// apply authentication for each request
router.use(verifyAuthentication);

// @desc routes for get or clear cart
router
  .route("/my-cart")
  .get(cartController.getMyCart)
  .delete(cartController.clearCart);

// @desc routes for add product to cart
router
  .route("/add-to-cart")
  .post(cartRules.addCartItemOrQuantity, cartController.addToCart);

// @desc routes for remove product from cart
router
  .route("/remove-from-cart")
  .delete(cartRules.removeCartItemVal, cartController.removeCartItem);

// @desc routes for remove product from cart
router
  .route("/change-Quantity")
  .put(cartRules.addCartItemOrQuantity, cartController.changeQuantity);

// @desc apply coupon on cart to reset totla price
router.route("/apply-coupon").post(couponController.applyCoupon);

// @desc remove coupon applied on cart 
router.route("/remove-coupon").delete(couponController.removeCoupon);

module.exports = router;
