const express = require("express");
const ProdServ = require("../controllers/product.controller");
const prodRules = require("../Validations/productValidationRules");
const variationRoutes = require("./product.variation.Routes");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();
// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

router
.route("/test/:productID")
.get(ProdServ.test)

// @desc get all variations for specific product by ID
router.use(
  "/:productID/variations",
  prodRules.getSpecificProduct,
  variationRoutes,
);

// @desc routes for listing all categories and creating new Product
router
  .route("/")
  .get(ProdServ.getAllProducts)
  .post(adminGuard, prodRules.createProductValidator, ProdServ.createProduct);

// @desc routes for get ,update and delete specific Product by id
router
  .route("/:productID")
  .get(prodRules.getSpecificProduct, ProdServ.getSpecificProduct)
  .put(
    adminGuard,
    prodRules.updateProductValidator,
    ProdServ.updateSpecificProduct,
  )
  .delete(
    adminGuard,
    prodRules.getSpecificProduct,
    ProdServ.deleteSpecificProduct,
  );

module.exports = router;
