const subCategory = require("../models/subCategoryModel");
const ApiError = require("../utils/apiError");
const { QueryListing } = require("../utils/queryListing");
const categoryServ = require("./category.service");

// create subCategory
exports.create = async (req) => {
  let categoryID = req.params.categoryID || req.body.categoryID;
  let category = await categoryServ.getById(categoryID);
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
exports.list = (req) => {
  const query = req.query;
  if (req.params["categoryID"]) {
    query["categoryID"] = req.params.categoryID;
  }
  return QueryListing(subCategory, query);
};

// get specific subCategory
exports.getById = (id) => subCategory.findById(id);

exports.updateById = (id, updates) =>
  subCategory.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

exports.deleteAll = () => subCategory.deleteMany({});

exports.deleteById = (id) => subCategory.findByIdAndDelete(id);
