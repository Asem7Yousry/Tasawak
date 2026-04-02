const { productVariation } = require("../models/productModel");
const { getCache, cacheRedis } = require("../utils/redis.methods");

///////////// product variations services ////////////////
exports.getById = async (productVariationId) => {
  let variation = await getCache(`variation_${productVariationId}`);
  if (!variation) {
    variation = await productVariation.findById(productVariationId);
    await cacheRedis(`variation_${productVariationId}`, variation);
  }
  return variation;
};

exports.create = (req) => {
  let data = req.body;
  data["productId"] = req.params.productID;
  return productVariation.create(data);
};

exports.updateById = (productVariationId, updates) => {
  let { _id, ...data } = updates;
  return productVariation.findByIdAndUpdate(productVariationId, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteById = async (productVariationId) => {
  return productVariation.findOneAndDelete({ _id: productVariationId });
};
