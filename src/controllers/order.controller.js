const orderServ = require("../services/order.user.Service");
const orderAdminServ = require("../services/order.admin.service");
const factory = require("./factoryHandler");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
// const { webhookCheckout, test } = require("../utils/stripe.methods");
const eventHandler = require("../utils/stripe_utils/eventHandler.stripe");
const stripeRefund = require("../utils/stripe_utils/refund.stripe");

// @doc create new order by user
// @route Post /api/order
// @access private
exports.createOrder = factory.createDoc(orderServ);

// @doc list all orders for a user
// @route Get /api/order
// @access private
exports.listMyOrders = factory.getAllDoc(orderServ, "Order");

// @doc get specific order for a user
// @route Get /api/order/:orderId
// @access private
exports.getMyOrder = asyncHandler(async (req, res, next) => {
  try {
    const order = await orderServ.getMyOrder(req);
    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc list all orders for admin
// @route Get /api/order/admin
// @access private
exports.listAdminOrders = factory.getAllDoc(orderAdminServ, "Order");

// @doc update specific order for admin
// @route put /api/order/admin/:orderId
// @access private
exports.updateOrderAdmin = factory.updateSpecificDoc(
  orderAdminServ,
  "Order",
  "orderId",
);

// @doc get specific order for admin
// @route Get /api/order/admin/:orderId
// @access private
exports.getOrderAdmin = factory.getSpecificDoc(
  orderAdminServ,
  "Order",
  "orderId",
);

// @doc webhook handler for Stripe events (e.g., payment success)
// @route Post /api/order/webhook-completed
// @access public (Stripe will call this endpoint)
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  await eventHandler.checkEvent(req, res);
});

// @doc refund order
// @route Post /api/order/:orderId/refund
// @access private
exports.refundOrder = asyncHandler(async (req, res, next) => {
  try {
    const order = await orderServ.getMyOrder(req, {
      status: { $nin: ["canceled", "delivered"] },
      paymentId: { $ne: null },
    });
    const refund = await stripeRefund.refundPayment(
      order.paymentId,
      order.totalPrice,
    );
    res.status(200).json({
      success: true,
      message: "Order refunded successfully",
      data: null,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc refund orders and cancel it
// @route Post /api/order/refund
// @access private (admin only)
exports.refundOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await orderAdminServ.refundOrders();
    res.status(200).json({
      success: true,
      message: "Orders refunded successfully",
      data: null,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc sucscription
// @route Post /api/order/subscription
// @access private
exports.subscription = asyncHandler(async (req, res, next) => {
  try {
    const subSession = await orderServ.subscription(req);
    res.status(200).json({
      success: true,
      message: "done",
      data: subSession,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});

// test
exports.test = asyncHandler(async (req, res, next) => {
  try {
    const paymentIntent = await test(req.body.paymentId);
    res.status(200).json({
      success: true,
      message: "done",
      data: null,
    });
  } catch (error) {
    return next(new ApiError(error.message, error.statusCode));
  }
});
