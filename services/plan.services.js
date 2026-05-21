const Plan = require("../models/plan.model");
const ApiError = require("../utils/ApiError");
const stripeProduct = require("../utils/stripe_utils/product.stripe");
const stripePrice = require("../utils/stripe_utils/price.stripe");
const { QueryListing } = require("../utils/queryListing");
const stripeMethods = require("../utils/stripe.methods");

// create new plan
exports.create = async (req) => {
  const planProduct = await stripeProduct.createProduct(
    req.body.name,
    req.body.description,
  );
  const costs = [];
  for (const cost of req.body.costs) {
    const planPrice = await stripePrice.createPrice(
      planProduct.id,
      cost.price,
      cost.currency,
      cost.interval,
      cost.interval_count,
    );
    costs.push({
      price: cost.price,
      currency: planPrice.currency,
      interval: planPrice.recurring.interval,
      interval_count: planPrice.recurring.interval_count,
      stripePriceId: planPrice.id,
    });
  }
  let planData = {
    name: planProduct.name,
    description: planProduct.description,
    costs: costs,
    stripeProductId: planProduct.id,
  };
  if (Array.isArray(req.body.features)) {
    planData.features = req.body.features;
  }
  const newPlan = await Plan.create(planData);
  return newPlan;
};

// list all plans
exports.list = async (req) => {
  let query = req.query;
  return QueryListing(Plan, query);
};

// get specific plan by id
exports.getById = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new ApiError("Plan not found", 404);
  }
  return plan;
};

// delete specific plan by id
exports.deleteById = async (id) => {
  const plan = await Plan.findById(id);
  await stripeProduct.archiveProduct(plan.stripeProductId);
  for (const cost of plan.costs) {
    await stripePrice.archivePrice(cost.stripePriceId);
  }
  const deletedPlan = await Plan.findByIdAndDelete(id);
  if (!deletedPlan) {
    throw new ApiError("Plan not found", 404);
  }
  return deletedPlan;
};

// get cost price for specific plan by id
exports.getCostById = async (planID, costID) => {
  const plan = await this.getById(planID);
  const cost = plan.costs.id(costID);
  if (!cost) {
    throw new ApiError("Cost not found", 404);
  }
  return { cost, plan };
};

// update specific plan by id (update product and price on stripe)
exports.updateById = async (id, updateData) => {
  const plan = await Plan.findByIdAndUpdate(id, updateData, { new: true });
};

// update name or description of specific plan by id (update product on stripe)
exports.updatePlanProduct = async (id, updateData) => {
  const plan = await this.getById(id);
  try {
    if (updateData.name || updateData.description || updateData.features) {
      await stripeProduct.updateProduct(plan.stripeProductId, {
        name: updateData.name || plan.name,
        description: updateData.description || plan.description,
        metadata: {
          features:
            JSON.stringify(updateData.features) ||
            JSON.stringify(plan.features),
        },
      });
      plan.name = updateData.name || plan.name;
      plan.description = updateData.description || plan.description;
      plan.features = updateData.features || plan.features;
      await plan.save();
      return plan;
    }
  } catch (error) {
    throw new ApiError("Failed to update plan: " + error.message, 500);
  }
};

exports.updatePrice = async (planID, costID, updateData) => {
  const { cost, plan } = await this.getCostById(planID, costID);
  try {
    // archive ancient price on stripe
    await stripePrice.archivePrice(cost.stripePriceId);
    // create new price on stripe with updated data
    const newPrice = await stripePrice.createPrice(
      plan.stripeProductId,
      updateData.price || cost.price,
      updateData.currency || cost.currency,
      updateData.interval || cost.interval,
      updateData.interval_count || cost.interval_count,
    );
    // update cost data in database
    cost.price = updateData.price || cost.price;
    cost.currency = updateData.currency || cost.currency;
    cost.interval = updateData.interval || cost.interval;
    cost.interval_count = updateData.interval_count || cost.interval_count;
    cost.stripePriceId = newPrice.id;
    plan.costs.id(costID).set(cost);
    await plan.save();
    return cost;
  } catch (error) {
    throw new ApiError("Failed to update price: " + error.message, 500);
  }
};

exports.createPlanCost = async (planID, postData) => {
  const plan = await this.getById(planID);
  try {
    const newCostData = {
      price: postData.price,
      currency: postData.currency || "egp",
      interval: postData.interval,
      interval_count: postData.interval_count || 1,
    };
    const newPrice = await stripePrice.createPrice(
      plan.stripeProductId,
      ...Object.values(newCostData),
    );
    const newCost = {
      stripePriceId: newPrice.id,
      ...newCostData,
    };
    plan.costs.push(newCost);
    await plan.save();
    return newCost;
  } catch (error) {
    throw new ApiError("Failed to create plan cost: " + error.message, 500);
  }
};

exports.subscribeToPlanCost = async (req, planID, costID) => {
  const { cost } = await this.getCostById(planID, costID);
  try {
    const session = await stripeMethods.createSubscription(
      req,
      cost.stripePriceId,
    );
    return session;
  } catch (error) {
    console.log(error);
    throw new ApiError(
      "Failed to subscribe to plan cost: " + error.message,
      500,
    );
  }
};
