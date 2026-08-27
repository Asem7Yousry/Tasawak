const { Product } = require("../models/productModel");
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

// get specific Product
exports.getById = async (id) => {
  // get product from cache first
  let key = `product_${id}`;
  let product = await getCache(key);
  // if not cached get from DB
  if (!product) {
    product = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "productvariations",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$productId", "$$productId"] } },
            },
            {
              $project: { productId: 0, __v: 0, createdAt: 0, updatedAt: 0 },
            },
          ],
          as: "variations",
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$variations.quantity" },
        },
      },
      {
        $project: { createdAt: 0, updatedAt: 0, slug: 0, __v: 0 },
      },
    ]);
    if (!product.length) {
      throw new ApiError(`no product found with ID ${id}`, 404);
    }
    product[0].variations = product[0].variations.reduce(
      (acc, { _id, ...variation }) => {
        acc[_id] = variation;
        return acc;
      },
      {},
    );
    product = product[0];
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
