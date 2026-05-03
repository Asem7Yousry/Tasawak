const ShippingCost = require("../models/shipping.cost.model");
const { QueryListing } = require("../utils/queryListing");
const ApiError = require("../utils/apiError");
const { chainWords, checkDuplicate } = require("../utils/global.utils");
const {
  createShippingRate,
  archiveShippingRate,
} = require("../utils/stripe.methods");

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
    currency: req.body.currency,
  };
  console.log(dataToCreate);
  const stripeShippingRate = await createShippingRate(dataToCreate);
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
  let oldShippingCost = await ShippingCost.findById(id);
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
  await archiveShippingRate(oldShippingCost.stripeShippingRateId);
  const newStripeShippingRate = await createShippingRate(
    city,
    area,
    updates.cost || oldShippingCost.cost,
    updates.currency || oldShippingCost.currency,
  );
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
  console.log(allShippingCosts.length);
  if (!allShippingCosts.length) return;
  await Promise.all(
    allShippingCosts.map((cost) =>
      archiveShippingRate(cost.stripeShippingRateId),
    ),
  );
  return ShippingCost.deleteMany({});
};

exports.deleteById = async (id) => {
  const shippingCost = await ShippingCost.findById(id);
  if (!shippingCost) throw new ApiError("Shipping rate not found", 404);
  await archiveShippingRate(shippingCost.stripeShippingRateId);
  await shippingCost.deleteOne();
  return shippingCost;
};
