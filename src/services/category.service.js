const Category = require("../models/categoryModel");
const commonCrudService = require("./common.service");

class CategoryService extends commonCrudService {
  constructor() {
    super(Category);
  }

  create(req) {
    let data = req.body;
    data.parentCategoryId = req?.params["categoryID"] || null;
    return this.model.create(data);
  }

  list(req) {
    const filter = {
      parentCategoryId: null,
    };

    if (req.params?.title) {
      filter.title = req.params.title;
    }

    return Category.aggregate([
      {
        $match: filter,
      },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentCategoryId",
          as: "subCategories",
        },
      },
    ]).then((categories) => {
      return categories.map((category) => {
        const subCategories = category.subCategories;

        const map = new Map();

        for (const subCategory of subCategories) {
          map.set(subCategory._id.toString(), {
            ...subCategory,
            subCategories: [],
          });
        }

        for (const subCategory of subCategories) {
          if (subCategory.parentCategoryId) {
            const parent = map.get(subCategory.parentCategoryId.toString());

            if (parent) {
              parent.subCategories.push(map.get(subCategory._id.toString()));
            }
          }
        }

        category.subCategories = subCategories
          .filter(
            (subCategory) =>
              subCategory.parentCategoryId.toString() ===
              category._id.toString(),
          )
          .map((subCategory) => map.get(subCategory._id.toString()));

        return category;
      });
    });
  }
}

module.exports = new CategoryService();
