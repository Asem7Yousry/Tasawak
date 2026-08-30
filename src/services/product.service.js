const { Product, productVariation } = require("../models/productModel");
const { QueryListing } = require("../utils/queryListing");
const { getCache, cacheRedis, delCache } = require("../utils/redis.methods");
const ApiError = require("../utils/apiError");
const mongoose = require("mongoose");

// create Product
exports.create = (req) => Product.create(req.body);

// list all Products
exports.list = (req) => {
  return QueryListing(Product, req.query);
};

// test
exports.test = async (req, res) => {
  const data = await productVariation.aggregate([
    // { $match: { _id: new mongoose.Types.ObjectId(req.params.productID) } },
    {
      $lookup: {
        // join
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.categoryID",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category",
        productsCount: { $addToSet: "$product._id" },
        productVariationCount: { $sum: 1 },
        productTotalCost: { $sum: "$piecePrice" },
        productTotalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $project: {
        categoryName: "$_id.title",
        categorySlug: "$_id.slug",
        _id: 0,
        productVariationCount: 1,
        productsCount: { $size: "$productsCount" },
        productTotalCost: 1,
        productTotalQuantity: 1,
      },
    },
  ]);
  res
    .json({
      message: "Test",
      data: data,
    })
    .status(200);
};

// get specific Product
exports.getById = async (id) => {
  // get product from cache first
  let key = `product_${id}`;
  let product = await getCache(key);
  // if not cached get from DB by aggregation pipeline
  if (!product) {
    product = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "productvariations",
          localField: "_id",
          foreignField: "productId",
          as: "variations",
          pipeline: [
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                productId: 0,
                __v: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$variations.quantity" },
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          slug: 0,
          __v: 0,
        },
      },
    ]);
    if (!product.length) {
      throw new ApiError(`no product found with ID ${id}`, 404);
    }
    await cacheRedis(key, product);
  }
  return product;
};

exports.updateById = (id, updates) => {
  let { _id, brandID, ...data } = updates;
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteAll = () => Product.deleteMany({});

exports.deleteById = async (id) => {
  await delCache(`product_${id}`);
  await Product.findByIdAndDelete(id);
};

exports.bulkWrite = (operations) => Product.bulkWrite(operations);
