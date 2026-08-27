const { check } = require("express-validator");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");
const Category = require("../models/categoryModel");
const subCategory = require("../models/subCategoryModel");
const ApiError = require("../utils/apiError");

// middle ware rules for validation of products//

// basic and not required validation used in creation or updating //
const BasicValidation = [
  check("colors").optional().isArray().withMessage("colors must array"),
  check("sizes").optional().isArray().withMessage("sizes must array"),
  check("images").optional().isArray().withMessage("images must array"),
  check("imageCover")
    .optional()
    .isString()
    .withMessage("image cover link must string"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("quantity must be number")
    .isInt()
    .withMessage("quantity must be integer number")
    .isFloat({ min: 0 })
    .withMessage("quantity must be above 0"),
];

exports.getSpecificProduct = [
  check("productID").isMongoId().withMessage("not Valid Mongo Id for product"),
  validatorMiddleWare,
];

exports.createProductValidator = [
  BasicValidation,
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("name can't be less than 3")
    .isLength({ max: 20 })
    .withMessage("name can't be more than 20"),
  check("description")
    .notEmpty()
    .withMessage("description is required")
    .isLength({ min: 10 })
    .withMessage("description can't be less than 3"),
  check("subCategories.*")
    .isMongoId()
    .withMessage("not Valid Mongo Id for subCategory"),
  check("basePrice")
    .notEmpty()
    .withMessage("price is required")
    .isNumeric()
    .withMessage("price must be number"),
  check("categoryID")
    .isMongoId()
    .withMessage("not Valid Mongo Id for category")
    // check if category is already exists in DB
    .custom(async (categoryID, { req }) => {
      let category = await Category.findById(categoryID);
      if (!category) {
        return Promise.reject(
          new ApiError(`no Category found with id: ${categoryID}`, 404),
        );
      } else {
        req.body.categoryName = category.title;
      }
    }),
  check("subCategories")
    .notEmpty()
    .withMessage("subCategories are required")
    .isArray()
    .withMessage("subCategories must be array of IDs")
    // check if there are duplicate subCategories IDs
    .custom((subCategories) => {
      let setSubCategories = new Set(subCategories);
      if (subCategories.length > setSubCategories.size) {
        return Promise.reject(
          new ApiError(
            `${
              subCategories.length - setSubCategories.size + 1
            } of subCategories IDs are duplicated`,
            404,
          ),
        );
      }
      return true;
    })
    // check if subcategories belongs to category
    .custom(async (subCategories, { req }) => {
      let subCategoriesObject = await subCategory.find({
        $and: [
          { _id: { $in: subCategories } },
          { categoryID: req.body.categoryID },
        ],
      });
      if (subCategoriesObject.length !== subCategories.length) {
        return Promise.reject(
          new ApiError(
            `${subCategories.length - subCategoriesObject.length} from ${
              subCategories.length
            } of subCategories IDs are not belong to category ID`,
            404,
          ),
        );
      }
    }),
  validatorMiddleWare,
];

exports.updateProductValidator = [
  BasicValidation,
  check("productID").isMongoId().withMessage("not Valid Mongo Id for category"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("name can't be less than 3")
    .isLength({ max: 20 })
    .withMessage("name can't be more than 20"),
  check("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("description can't be less than 3"),
  check("rateAverage")
    .optional()
    .isInt()
    .withMessage("Rat average must be integer")
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating average must be between 0 and 5"),
  check("rateCount")
    .optional()
    .isInt()
    .withMessage("Rat count must be integer")
    .isFloat({ min: 0 })
    .withMessage("rating count must be above or equal 0"),
  check("sold")
    .optional()
    .isInt()
    .withMessage("sold count must be integer")
    .isFloat({ min: 0 })
    .withMessage("sold count must be above or equal 0"),
  validatorMiddleWare,
];
