const { Product } = require("../models/productModel");
const CommonService = require("./common.service");
const { getCache, cacheRedis } = require("../utils/redis.methods");
const ApiError = require("../utils/apiError");
const mongoose = require("mongoose");

class ProductService extends CommonService {
  async getById(id) {
    // get product from cache first
    const key = `product_${id}`;
    let product = await getCache(key);
    // if not cached get from DB by aggregation pipeline
    if (!product) {
      product = await this.model.aggregate([
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
                  _id: 1,
                  createdAt: 0,
                  updatedAt: 0,
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
      product = product[0];
      if (!this.model.length) {
        throw new ApiError(`no product found with ID ${id}`, 404);
      }
      await cacheRedis(key, product);
    }
    return product;
  }

  bulkWrite(operations) {
    this.model.bulkWrite(operations);
  }
}

module.exports = new ProductService(Product);
