const express = require("express");
const ProdServ = require("../controllers/product.variation.controller");
// const prodRules = require("../Validations/productValidationRules");
const { isAdmin, verifyAuthentication } = require("../utils/AuthMethods");

const router = express.Router({ mergeParams: true });

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for listing all categories and creating new Product
router.route("/").post(adminGuard, ProdServ.createProductVariation);

// @desc routes for get ,update and delete specific Product by id
router
  .route("/:productVariationId")
  .put(adminGuard, ProdServ.updateSpecificProductVariation)
  .delete(adminGuard, ProdServ.deleteSpecificProductVariation);

module.exports = router;
