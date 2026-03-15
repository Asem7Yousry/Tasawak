const subCategory = require("../models/subCategoryModel");
const ApiError = require("../utils/apiError");
const { QueryListing } = require("../utils/queryListing");
const categoryServ = require("./category.service");

// create subCategory
exports.createSubCategory = async (req) => {
  let categoryID = req.params.categoryID || req.body.categoryID;
  let category = await categoryServ.getCategoryById(categoryID);
  if (category) {
    return await subCategory.create({
      title: req.body.title,
      categoryID: categoryID,
      categoryName: category.title,
    });
  } else {
    throw new ApiError(`no category with id:${categoryID}`, 404);
  }
};

// list all subCategories
exports.listsubCategories = (query) => {
  return QueryListing(subCategory, query);
};

// get specific subCategory
exports.getSubCategoryById = (id) => subCategory.findById(id);

exports.updateSubCategoryById = (id, updates) =>
  subCategory.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

exports.deleteAllSubCategorys = () => subCategory.deleteMany({});

exports.deleteSubCategoryById = (id) => subCategory.findByIdAndDelete(id);
