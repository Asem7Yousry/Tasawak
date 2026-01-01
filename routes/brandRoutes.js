const express = require("express");
const BrandServ = require("../controllers/brandService");
const brandValidation = require("../middlewares/validationRules/brandValidationRules");

const router = express.Router();

// @desc routes for listing all brands and creating new brand
router
  .route("/")
  .get(BrandServ.getAllBrand)
  .post(brandValidation.createBrandValidator, BrandServ.createBrand);

// @desc routes for get ,update and delete specific brand by id
router
  .route("/:brandID")
  .get(brandValidation.getSpecificBrandValidator, BrandServ.getSpecificBrand)
  .put(brandValidation.getSpecificBrandValidator, BrandServ.updateSpecificBrand)
  .delete(
    brandValidation.getSpecificBrandValidator,
    BrandServ.deleteSpecificBrand
  );

module.exports = router;
