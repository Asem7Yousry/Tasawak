const ShippingCost = require("../models/shipping.cost.model");
const { QueryListing } = require("../utils/queryListing");
const ApiError = require("../utils/apiError");

// create ShippingCost
exports.create = (req) => ShippingCost.create(req.body);

// list all shipping costs
exports.list = (req) => {
  return QueryListing(ShippingCost, req.query);
};

// get specific shipping cost
exports.getById = (id) => ShippingCost.findById(id);

exports.updateById = async (id, updates) => {
  const { city, area, cost, currency } = updates;
  let oldShippingCost = await ShippingCost.findById(id);
  if (!oldShippingCost) throw new ApiError("Shipping rate not found", 404);

  // ✅ Normalize incoming values the same way the hook does
  const normalize = (str) => str?.trim().replace(/\s+/g, "-").toLowerCase();

  const normalizedCity = normalize(city);
  const normalizedArea = normalize(area);

  // ✅ Compare normalized values against stored values
  const hasChanges =
    (normalizedCity && normalizedCity !== oldShippingCost.city) ||
    (normalizedArea && normalizedArea !== oldShippingCost.area) ||
    (cost && cost !== String(oldShippingCost.cost)) ||
    (currency && currency !== oldShippingCost.currency);
  if (!hasChanges) return oldShippingCost;

  oldShippingCost.city = city ?? oldShippingCost.city;
  oldShippingCost.area = area ?? oldShippingCost.area;
  oldShippingCost.cost = cost ?? oldShippingCost.cost;
  oldShippingCost.currency = currency ?? oldShippingCost.currency;
  await oldShippingCost.save();
  return oldShippingCost;
};

exports.deleteAll = () => ShippingCost.deleteMany({});

exports.deleteById = async (id) => {
  const shippingCost = await ShippingCost.findById(id);
  if (!shippingCost) throw new ApiError("Shipping rate not found", 404);
  await shippingCost.deleteOne();
  return shippingCost;
};
