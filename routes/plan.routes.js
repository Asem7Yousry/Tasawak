const express = require("express");
const planServ = require("../controllers/plan.controller");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");
// const brandValidation = require("../Validations/brandValidationRules");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

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
router.route("/:planID/costs/:costID").get(planServ.getSpecificCost).put(
  adminGuard,
  // brandValidation.getSpecificBrandValidator,
  planServ.updateSpecificPlanCost,
);
// .delete(
//   adminGuard,
//   // brandValidation.getSpecificBrandValidator,
//   planServ.deleteSpecificPlan,
// );

module.exports = router;
