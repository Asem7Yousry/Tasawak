const express = require("express");
const ProdServ = require("../controllers/productService");
const prodRules = require("../utils/validationRules/productValidationRules");

const router = express.Router();

// @desc routes for listing all categories and creating new Product
router
  .route("/")
  .get(ProdServ.getAllProducts)
  .post(prodRules.createProductValidator, ProdServ.createProduct);

// @desc routes for get ,update and delete specific Product by id
router
  .route("/:productID")
  .get(prodRules.getSpecificProduct, ProdServ.getSpecificProduct)
  .put(prodRules.updateProductValidator, ProdServ.updateSpecificProduct)
  .delete(prodRules.getSpecificProduct, ProdServ.deleteSpecificProduct);

module.exports = router;
