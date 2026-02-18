const express = require("express");
const subCatControlers = require("../controllers/subCategoryService");
const subCatRules = require("../Validations/subCategoryValidations");

const router = express.Router({ mergeParams: true });

router
  .route("")
  .get(subCatControlers.getAllSubCategory)
  .post(
    subCatRules.subCategoryValidationRules,
    subCatControlers.createSubCategory
  );

router
  .route("/:subCategoryID")
  .get(
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.getSpecificSubCategory
  )
  .put(
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.updateSpecificSubCategory
  )
  .delete(
    subCatRules.getSpecificSubCategoryValidator,
    subCatControlers.deleteSpecificSubCategory
  );

module.exports = router;
