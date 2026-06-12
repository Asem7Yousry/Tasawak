const factory = require("./factoryHandler");
const planServices = require("../services/plan.services");
const asyncHandler = require("express-async-handler");
const paymentMethodService = require("../utils/stripe_utils/paymentMethod.stripe");
const stripeCustomer = require("../utils/stripe_utils/customer.stripe");
const stripePrice = require("../utils/stripe_utils/price.stripe");
const stripeSubscription = require("../utils/stripe_utils/subscription.stripe");

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
  const subscription = await planServices.subscribeToPlanCost(req);
  res.status(200).json({ status: "success", data: subscription });
});

// @doc add new payment method to customer
// @route post /api/plan/add-payment-method
// @access private (authenticated users)
exports.addPaymentMethodtoCustomer = asyncHandler(async (req, res) => {
  const paymentMethod = await planServices.addPaymentMethodtoCustomer(req);
  res.status(200).json({ status: "success", data: paymentMethod });
});

// @doc delete payment method from customer
// @route post /api/plan/delete-payment-method
// @access private (authenticated users)
exports.deletePaymentMethodfromCustomer = asyncHandler(async (req, res) => {
  await planServices.detachPaymentMethod(req);
  res.status(200).json({
    status: "success",
    message: "Payment method detached successfully",
  });
});

// @doc set default payment method for customer
// @route post /api/plan/set-default-payment-method
// @access private (authenticated users)
exports.setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const updatedCustomer = await planServices.setDefaultPaymentMethod(req);
  res.status(200).json({ status: "success", data: updatedCustomer });
});

// @doc list all payment methods of a customer
// @route get /api/plan/list-payment-methods
// @access private (authenticated users)
exports.listCustomerPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await planServices.listCustomerPaymentMethods(req);
  res.status(200).json({ status: "success", data: paymentMethods });
});

// @doc get user subscription
// @route get /api/plan/subscription
// @access private (authenticated users)
exports.getUserSubscription = asyncHandler(async (req, res) => {
  const subscription = await planServices.getUserSubscription(req);
  res.status(200).json({ status: "success", data: subscription });
});

// @doc change subscription price
// @route put /api/plan/subscription
// @access private (authenticated users)
exports.changeSubscriptionPrice = asyncHandler(async (req, res) => {
  const subscription = await planServices.changeSubscriptionPrice(req);
  res.status(200).json({ status: "success", data: subscription });
});

exports.testplan = asyncHandler(async (req, res) => {
  try {
    // const paymentMethod = await paymentMethodService.retrievePaymentMethod(
    //   req.body.id,
    // );

    // const paymentMethod = await paymentMethodService.detachPaymentMethod(
    //   req.body.id,
    // );

    const paymentMethod = await stripeCustomer.retrieveCustomer(req.body.id);
    // const paymentMethod = await stripeCustomer.listCustomerPaymentMethods(
    //   req.body.id,
    // );

    // const paymentMethod = await stripePrice.getPrice(
    //   req.body.id,
    // );
    // const paymentMethod = await stripeSubscription.retrieveSubscription(
    //   req.body.id,
    // );
    res.status(200).json({ status: "success", data: paymentMethod });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});
