const ShippingCost = require("../models/shipping.cost.model");
const ApiError = require("../utils/apiError");
const { chainWords, checkDuplicate } = require("../utils/global.utils");
const stripeShippingCost = require("../utils/stripe_utils/shippingCost.stripe");
const commonCrudService = require("./common.service");
const { getCart, updateByUserId } = require("./cart.service");

class ShippingCostService extends commonCrudService {
  async create(req) {
    // normalize city and area to ensure consistent
    let city = chainWords(req.body.city);
    let area = chainWords(req.body.area);
    // check for duplicate before creating
    const duplicate = await checkDuplicate(
      this.model,
      { city, area },
      "Shipping price already exists for this city and area together",
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
    const shippingCost = await this.model.create({
      ...dataToCreate,
      stripeShippingRateId: stripeShippingRate.id,
    });
    return shippingCost;
  }

  async updateById(id, updates) {
    // check if exists
    let oldShippingCost = await this.model.findById(id);
    if (!oldShippingCost) throw new ApiError("Shipping cost not found", 404);
    // normalizze incoming city and area for comparison and duplication check
    const city = updates?.city
      ? chainWords(updates.city)
      : oldShippingCost.city;
    const area = updates?.area
      ? chainWords(updates.area)
      : oldShippingCost.area;
    if (updates.city || updates.area) {
      let duplicate = await checkDuplicate(
        this.model,
        { city, area },
        "Shipping price already exists for this city and area together",
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
    const updatedShippingCost = await this.model.findByIdAndUpdate(
      id,
      { ...updates, stripeShippingRateId: newStripeShippingRate.id },
      { new: true },
    );
    return updatedShippingCost;
  }

  async deleteAll() {
    let allShippingCosts = await this.model.find({});
    if (!allShippingCosts.length)
      return new ApiError("No shipping costs found", 404);
    await Promise.all(
      allShippingCosts.map((cost) =>
        stripeShippingCost.archiveShippingRate(cost.stripeShippingRateId),
      ),
    );
    return this.model.deleteMany({});
  }

  async deleteById(id) {
    const shippingCost = await this.model.findById(id);
    if (!shippingCost) throw new ApiError("Shipping cost not found", 404);
    await stripeShippingCost.archiveShippingRate(
      shippingCost.stripeShippingRateId,
    );
    return shippingCost.deleteOne();
  }

  async getByAddress(req) {
    const address = req.body?.address || req.user.address;
    if (!address || !address.city || !address.areaName) {
      throw new ApiError(
        "please add address first to calculate shipping cost",
        400,
      );
    }
    const city = address.city.trim().replace(/\s+/g, "-").toLowerCase();
    const area = address.areaName.trim().replace(/\s+/g, "-").toLowerCase();
    const shippingRate = await this.model.findOne({
      $or: [{ city, area }, { city, area: "default" }, { city: "default" }],
    });
    return {
      shippingId: shippingRate.stripeShippingRateId,
      SHIPPING_COST: shippingRate.cost,
      address,
    };
  }

  async applyShippingCostToCart(req) {
    let cart = await getCart(req.user._id);
    if (cart?.shippingPrice) {
      cart.totalPrice -= cart.shippingPrice;
    }
    let { SHIPPING_COST, address } = await this.getByAddress(req);
    const totalPrice = cart.totalPrice + SHIPPING_COST;
    let updates = { shippingPrice: SHIPPING_COST, totalPrice, address };
    cart = await updateByUserId(req.user._id, updates);
    return cart;
  }
}

module.exports = new ShippingCostService(ShippingCost);
