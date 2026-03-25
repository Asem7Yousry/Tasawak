const Product = require("../models/productModel");
const { QueryListing } = require("../utils/queryListing");
const { getCache, cacheRedis, delCache } = require("../utils/redis.methods");
const ApiError = require("../utils/apiError");

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
    product = await Product.findById(id);
    if (!product) {
      throw new ApiError(`no product found with ID ${id}`, 404);
    }
    let { createdAt, updatedAt, slug, __v, ...restProduct } = product._doc;
    product = restProduct;
    await cacheRedis(key, product, Number(process.env.Redis_Expriation_Time));
  }
  return product;
};

exports.updateById = (id, updates) =>
  Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

exports.deleteAll = () => Product.deleteMany({});

exports.deleteById = async (id) => {
  await delCache(`product_${id}`);
  await Product.findByIdAndDelete(id);
};
