const ShippingCost = require("../models/shipping.cost.model");
const { QueryListing } = require("../utils/queryListing");
const ApiError = require("../utils/apiError");
const { chainWords, checkDuplicate } = require("../utils/global.utils");
const stripeShippingCost = require("../utils/stripe_utils/shippingCost.stripe");

// create ShippingCost
exports.create = async (req) => {
  // normalize city and area to ensure consistent
  let city = chainWords(req.body.city);
  let area = chainWords(req.body.area);
  // check for duplicate before creating
  const duplicate = await checkDuplicate(
    ShippingCost,
    { city, area },
    "Shipping price already exists for this city and area",
  );
  // Create corresponding shipping rate in Stripe
  const dataToCreate = {
    city,
    area,
    cost: Number(req.body.cost),
    currency: req.body.currency || "egp",
  };
  const stripeShippingRate =
    await stripeShippingCost.createShippingRate(dataToCreate);
  const shippingCost = await ShippingCost.create({
    ...dataToCreate,
    stripeShippingRateId: stripeShippingRate.id,
  });
  return shippingCost;
};

// list all shipping costs
exports.list = (req) => {
  return QueryListing(ShippingCost, req.query);
};

// get specific shipping cost
exports.getById = (id) => ShippingCost.findById(id);

exports.updateById = async (id, updates) => {
  // check if exists
  let oldShippingCost = await this.getById(id);
  if (!oldShippingCost) throw new ApiError("Shipping cost not found", 404);
  // normalizze incoming city and area for comparison and duplication check
  const city = updates?.city ? chainWords(updates.city) : oldShippingCost.city;
  const area = updates?.area ? chainWords(updates.area) : oldShippingCost.area;
  if (updates.city || updates.area) {
    let duplicate = await checkDuplicate(
      ShippingCost,
      { city, area },
      "Shipping price already exists for this city and area",
    );
  }
  // archive old shipping rate in Stripe and create new shipping rate
  await stripeShippingCost.archiveShippingRate(
    oldShippingCost.stripeShippingRateId,
  );
  const shippingRateData = {
    city,
    area,
    cost: updates.cost || oldShippingCost.cost,
    currency: updates.currency || oldShippingCost.currency,
  };
  const newStripeShippingRate =
    await stripeShippingCost.createShippingRate(shippingRateData);
  // update shipping cost in database
  const updatedShippingCost = await ShippingCost.findByIdAndUpdate(
    id,
    { ...updates, stripeShippingRateId: newStripeShippingRate.id },
    { new: true },
  );
  return updatedShippingCost;
};

exports.deleteAll = async () => {
  let allShippingCosts = await ShippingCost.find({});
  if (!allShippingCosts.length) return;
  await Promise.all(
    allShippingCosts.map((cost) =>
      stripeShippingCost.archiveShippingRate(cost.stripeShippingRateId),
    ),
  );
  return ShippingCost.deleteMany({});
};

exports.deleteById = async (id) => {
  const shippingCost = await ShippingCost.findById(id);
  if (!shippingCost) throw new ApiError("Shipping rate not found", 404);
  await stripeShippingCost.archiveShippingRate(
    shippingCost.stripeShippingRateId,
  );
  await shippingCost.deleteOne();
  return shippingCost;
};
