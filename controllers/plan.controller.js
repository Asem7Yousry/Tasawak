const factory = require("./factoryHandler");
const planServices = require("../services/plan.services");
const asyncHandler = require("express-async-handler");

// @doc create new Plan
// @route Post /api/plan
// @access private (admin)
exports.createPlan = factory.createDoc(planServices);

// @doc get all Plans
// @route Get /api/plan
// @access public
exports.getAllPlan = factory.getAllDoc(planServices, "Plan");

// @doc get specific plan by ID
// @route Get /api/plan/:planID
// @access public
exports.getSpecificPlan = factory.getSpecificDoc(
  planServices,
  "Plan",
  "planID",
);

// @doc delete specific plan by ID
// @route delete /api/plan/:planID
// @access private (admin)
exports.deleteSpecificPlan = factory.deleteSpecificDoc(
  planServices,
  "Plan",
  "planID",
);

// @doc update specific plan by ID
// @route put /api/plan/:planID
// @access private (admin)
exports.updateSpecificPlanProduct = asyncHandler(async (req, res) => {
  const updatedPlan = await planServices.updatePlanProduct(
    req.params.planID,
    req.body,
  );
  res.status(200).json({ status: "success", data: updatedPlan });
});

// @doc update specific plan cost by ID
// @route put /api/plan/:planID/cost/:costID
// @access private (admin)
exports.updateSpecificPlanCost = asyncHandler(async (req, res) => {
  const updatedCost = await planServices.updatePrice(
    req.params.planID,
    req.params.costID,
    req.body,
  );
  res.status(200).json({ status: "success", data: updatedCost });
});

// @doc get specific cost by ID
// @route get /api/plan/:planID/cost/:costID
// @access public
exports.getSpecificCost = asyncHandler(async (req, res) => {
  const { cost, plan } = await planServices.getCostById(
    req.params.planID,
    req.params.costID,
  );
  res.status(200).json({ status: "success", data: cost });
});

// @doc create new plan cost by ID
// @route post /api/plan/:planID/costs
// @access private (admin)
exports.createPlanCost = asyncHandler(async (req, res) => {
  const newCost = await planServices.createPlanCost(
    req.params.planID,
    req.body,
  );
  res.status(201).json({ status: "success", data: newCost });
});

// @doc create new subscription to specific plan cost by ID
// @route post /api/plan/:planID/costs/:costID/subscribe
// @access private (authenticated users)
exports.subscribeToPlanCost = asyncHandler(async (req, res) => {
  const session = await planServices.subscribeToPlanCost(
    req,
    req.params.planID,
    req.params.costID,
  );
  res.status(200).json({ status: "success", data: session });
});
