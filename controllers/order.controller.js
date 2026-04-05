const orderServ = require("../services/order.Service");
const asyncHandler = require("express-async-handler");

// @doc create new order
// @route Post /api/order
// @access private
exports.createOrder = asyncHandler(async (req, res) => {
  const data = await orderServ.checkOut(req.user._id);
  res.status(201).json({
    success: true,
    message: "created successfully!",
    document: data,
  });
});
