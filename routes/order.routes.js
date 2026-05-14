const express = require("express");
const orderController = require("../controllers/order.controller");
const { verifyAuthentication, isAdmin } = require("../utils/AuthMethods");

const router = express.Router();

// athentication check for admin
const adminGuard = [verifyAuthentication, isAdmin];

// @desc routes for creating order
router
  .route("/checkout")
  .post(verifyAuthentication, orderController.createOrder);

// webhook for stripe checkout session
router
  .route("/webhook-completed")
  .post(
    express.raw({ type: "application/json" }),
    orderController.webhookCheckout,
  );

// @desc routes of orders for a user
router.route("/").get(verifyAuthentication, orderController.listMyOrders);

// @ desc routes of listting all orders for admin
router.route("/admin").get(adminGuard, orderController.listAdminOrders);

// @ desc routes of get or update specific order for admin
router
  .route("/admin/:orderId")
  .get(adminGuard, orderController.getOrderAdmin)
  .put(adminGuard, orderController.updateOrderAdmin);

// @ desc routes of getting a specific order for a user
router.route("/:orderId").get(verifyAuthentication, orderController.getMyOrder);

// @ desc routes to refund an order
router
  .route("/:orderId/refund")
  .post(verifyAuthentication, orderController.refundOrder);
router.route("/refund").post(adminGuard, orderController.refundOrders);

module.exports = router;
