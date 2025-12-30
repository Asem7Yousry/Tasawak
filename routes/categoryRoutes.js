const express = require("express");
const Catserv = require("../controllers/categoryService");
const subCatRoutes = require("../routes/subCategoryRoutes");
const {
  getSpecificCategoryValidator,
  createCategoryValidator,
} = require("../middlewares/validationRules/categoryValidationRoules");

const router = express.Router();

// @desc get all subCategories for specific category by ID
router.use(
  "/:categoryID/subCategories",
  getSpecificCategoryValidator,
  subCatRoutes
);

// @desc routes for listing all categories and creating new category
router
  .route("/")
  .get(Catserv.getAllCategory)
  .post(createCategoryValidator, Catserv.createCategory);

// @desc routes for get ,update and delete specific category by id
router
  .route("/:categoryID")
  .get(getSpecificCategoryValidator, Catserv.getSpecificCategory)
  .put(getSpecificCategoryValidator, Catserv.updateSpecificCategory)
  .delete(getSpecificCategoryValidator, Catserv.deleteSpecificCategory);

module.exports = router;
