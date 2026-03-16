const express = require("express");
const subCatControlers = require("../controllers/subCategory.controller");
const subCatRules = require("../Validations/subCategoryValidations");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

const router = express.Router({ mergeParams: true });

router
  .route("")
  .get(subCatControlers.getAllSubCategory)
  .post(
    adminGuard,
    subCatRules.subCategoryValidationRules,
    subCatControlers.createSubCategory,
  );

router
  .route("/:subCategoryID")
  .get(
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.getSpecificSubCategory,
  )
  .put(
    adminGuard,
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.updateSpecificSubCategory,
  )
  .delete(
    adminGuard,
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.deleteSpecificSubCategory,
  );

module.exports = router;
