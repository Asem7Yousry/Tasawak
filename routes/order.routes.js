const express = require("express");
const orderController = require("../controllers/order.controller");
// const brandValidation = require("../Validations/brandValidationRules");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for creating order 
router
  .route("/create-order")
  .post(verifyAuthentication, orderController.createOrder);

module.exports = router;
