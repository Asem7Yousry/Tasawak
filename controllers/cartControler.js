const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const cartServices = require("../services/cart.service");

// @doc get specific cart by userID
// @route Get /api/cart/:userID
// @access private
exports.getMyCart = asyncHandler(async (req, res, next) => {
  let specificCart = await cartServices.getCart(req.user._id);
  if (!specificCart) {
    return next(new ApiError(`no cart for you`, 404));
  }
  res.status(200).json({ success: true, Cart: specificCart });
});

// @doc update specific cart by ID
// @route put /api/cart/:userID
// @access private
exports.addToCart = asyncHandler(async (req, res, next) => {
  let cart = await cartServices.addCartItem(
    req.user._id,
    req.body.productId,
    req.body.quantity || 1,
    req.product.price,
    req.product.name,
    req.product.quantity,
  );
  if (!cart) {
    return next(new ApiError(`cart ID ${req.user.cartId} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: "add to cart successfully!",
    data: { cart },
  });
});

// @doc remove product from cart
// @route delete /api/cart/remove-from-cart
// @access private
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  let cart = await cartServices.removeCartItem(
    req.user._id,
    req.body.productId,
  );
  res
    .status(202)
    .json({ success: true, message: "deleted successfully!", data: { cart } });
});

// @doc clear specific cart by userID
// @route delete /api/cart/my-cart/
// @access private
exports.clearCart = asyncHandler(async (req, res, next) => {
  let clearedCart = await cartServices.clearCart(req.user._id);
  if (!clearedCart) {
    return next(new ApiError(`cart ID ${req.user.cartId} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: "cleared cart successfully!",
    data: { cart: clearedCart },
  });
});

// @doc increament or decreament product quantity by 1 in cart
// @route put /api/cart/change-Quantity
// @access private
exports.changeQuantity = asyncHandler(async (req, res, next) => {
  let changedCart = await cartServices.changeCartItemQuantity(
    req.user._id,
    req.body.productId,
    req.body.quantity,
    req.product.price,
  );
  if (!changedCart) {
    return next(new ApiError(`cart ID ${req.user.cartId} not exists`, 404));
  }
  res.status(202).json({
    success: true,
    message: "cart updated successfully!",
    data: { cart: changedCart },
  });
});
