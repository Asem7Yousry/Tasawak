const express = require("express");
const planServ = require("../controllers/plan.controller");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");
// const brandValidation = require("../Validations/brandValidationRules");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for listing all plans and creating new plan
router.route("/test").get(planServ.testplan);

// @desc route for add new payment method to customer
router
  .route("/add-payment-method")
  .post(verifyAuthentication, planServ.addPaymentMethodtoCustomer);

// @desc route for delete payment method from customer
router
  .route("/delete-payment-method")
  .post(verifyAuthentication, planServ.deletePaymentMethodfromCustomer);

// @desc route for setting default payment method for customer
router
  .route("/set-default-payment-method")
  .post(verifyAuthentication, planServ.setDefaultPaymentMethod);

// @desc route for listing all payment methods of a customer
router
  .route("/list-payment-methods")
  .get(verifyAuthentication, planServ.listCustomerPaymentMethods);

// @desc routes for listing all plans and creating new plan
router.route("/").get(planServ.getAllPlan).post(
  adminGuard,
  // brandValidation.createBrandValidator,
  planServ.createPlan,
);

// @desc routes for get ,update and delete specific plan by id
router
  .route("/:planID")
  .get(planServ.getSpecificPlan)
  .put(
    adminGuard,
    // brandValidation.getSpecificBrandValidator,
    planServ.updateSpecificPlanProduct,
  )
  .delete(
    adminGuard,
    // brandValidation.getSpecificBrandValidator,
    planServ.deleteSpecificPlan,
  );

// @desc route for cratting new cost (price) for specific plan by id
router.route("/:planID/costs").post(
  adminGuard,
  // brandValidation.createBrandValidator,
  planServ.createPlanCost,
);

// @desc routes for get ,update and delete specific plan cost (price) by id
router
  .route("/:planID/costs/:costID")
  .get(planServ.getSpecificCost)
  .put(
    adminGuard,
    // brandValidation.getSpecificBrandValidator,
    planServ.updateSpecificPlanCost,
  )
  .delete(
    adminGuard,
    // brandValidation.getSpecificBrandValidator,
    planServ.deleteSpecificPlan,
  );

// @desc route for subscription to specific plan cost by id
router
  .route("/:planID/costs/:costID/subscribe")
  .post(verifyAuthentication, planServ.subscribeToPlanCost);

module.exports = router;
