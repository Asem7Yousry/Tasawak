const express = require("express");
const shoppingServ = require("../controllers/shipping.cost.controller");
// const prodRules = require("../Validations/productValidationRules");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();
// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for listing all categories and creating new Product
router
  .route("/")
  .get(adminGuard, shoppingServ.getAllShippingCosts)
  .post(adminGuard, shoppingServ.createShippingCost)
  .delete(adminGuard, shoppingServ.deleteAllShippingCosts);
//   .post(adminGuard, prodRules.createProductValidator, shoppingServ.createShippingCost);

// @desc routes for get ,update and delete specific ShippingCost by id
router
  .route("/:shippingCostID")
  .get(
    adminGuard,
    // prodRules.getSpecificProduct,
    shoppingServ.getSpecificShippingCost,
  )
  .put(
    adminGuard,
    // prodRules.updateProductValidator,
    shoppingServ.updateSpecificShippingCost,
  )
  .delete(
    adminGuard,
    // prodRules.getSpecificProduct,
    shoppingServ.deleteSpecificShippingCost,
  );

module.exports = router;
