const express = require("express");
const Catserv = require("../controllers/category.controller");
const subCatRoutes = require("../routes/subCategoryRoutes");
const {
  getSpecificCategoryValidator,
  createCategoryValidator,
} = require("../Validations/categoryValidationRoules");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc get all subCategories for specific category by ID
router.use(
  "/:categoryID/subCategories",
  getSpecificCategoryValidator,
  subCatRoutes,
);

// @desc routes for listing all categories and creating new category
router
  .route("/")
  .get(Catserv.getAllCategory)
  .delete(adminGuard, Catserv.deleteAllCategory)
  .post(adminGuard, createCategoryValidator, Catserv.createCategory);

// @desc routes for get ,update and delete specific category by id
router
  .route("/:categoryID")
  .get(getSpecificCategoryValidator, Catserv.getSpecificCategory)
  .put(adminGuard, getSpecificCategoryValidator, Catserv.updateSpecificCategory)
  .delete(
    adminGuard,
    getSpecificCategoryValidator,
    Catserv.deleteSpecificCategory,
  );

module.exports = router;
