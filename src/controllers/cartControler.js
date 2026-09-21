const asyncHandler = require("express-async-handler");
const cartServices = require("../services/cart.service");
const ShippingServ = require("../services/shipping.cost.services");

// @doc get specific cart by userID
// @route Get /api/cart/my-cart
// @access private
exports.getMyCart = asyncHandler(async (req, res) => {
  let specificCart = await cartServices.getCart(req.user._id);
  res.status(200).json({ success: true, Cart: specificCart });
});

// @doc update specific cart by ID
// @route put /api/cart/add-to-cart
// @access private
exports.addToCart = asyncHandler(async (req, res) => {
  let cart = await cartServices.addCartItem(
    req.user._id,
    req.body.variationId,
    req.product,
    req.body.quantity,
  );
  res.status(202).json({
    success: true,
    message: "add to cart successfully!",
    data: { cart },
  });
});

// @doc remove product from cart
// @route delete /api/cart/remove-from-cart
// @access private
exports.removeCartItem = asyncHandler(async (req, res) => {
  let cart = await cartServices.removeCartItem(
    req.user._id,
    req.body.variationId,
  );
  res
    .status(202)
    .json({ success: true, message: "deleted successfully!", data: { cart } });
});

// @doc clear specific cart by userID
// @route delete /api/cart/my-cart
// @access private
exports.clearCart = asyncHandler(async (req, res) => {
  let clearedCart = await cartServices.clearCart(req.user._id);
  res.status(202).json({
    success: true,
    message: "cleared cart successfully!",
    data: { cart: clearedCart },
  });
});

// @doc increament or decreament product quantity by 1 in cart
// @route put /api/cart/change-Quantity
// @access private
exports.changeQuantity = asyncHandler(async (req, res) => {
  let changedCart = await cartServices.changeCartItemQuantity(
    req.user._id,
    req.body.variationId,
    req.product,
    req.body.quantity,
  );
  res.status(202).json({
    success: true,
    message: "cart updated successfully!",
    data: { cart: changedCart },
  });
});

// @doc add address to cart to calculate ShippingCost
// @route post /api/shipping-cost/add-address-to-cart
// @access public
exports.sendAddressToCart = asyncHandler(async (req, res) => {
  const cart = await ShippingServ.applyShippingCostToCart(req);
  res.status(202).json({
    success: true,
    message: "shipping price added successfully!",
    data: {
      cart,
    },
  });
});
