const express = require("express");
const BrandServ = require("../controllers/brand.controller");
const brandValidation = require("../Validations/brandValidationRules");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for listing all brands and creating new brand
router
  .route("/")
  .get(BrandServ.getAllBrand)
  .post(
    adminGuard,
    brandValidation.createBrandValidator,
    BrandServ.createBrand,
  );

// @desc routes for get ,update and delete specific brand by id
router
  .route("/:brandID")
  .get(brandValidation.getSpecificBrandValidator, BrandServ.getSpecificBrand)
  .put(
    adminGuard,
    brandValidation.getSpecificBrandValidator,
    BrandServ.updateSpecificBrand,
  )
  .delete(
    adminGuard,
    brandValidation.getSpecificBrandValidator,
    BrandServ.deleteSpecificBrand,
  );

module.exports = router;
