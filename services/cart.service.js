const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
const redisClient = require("../config/redis.config");
const { getOrCreate } = require("../utils/jwtMethod");

// create new cart for each user
exports.createCart = (data) => Cart.create(data);

// get cart by userId
exports.getCart = async (userId) => {
  const cartKey = `cart_${userId}`;
  let cart;
  cart = await redisClient.get(cartKey);
  if (!cart) {
    cart = await getOrCreate(Cart, { userId: userId }, { userId: userId });
    await redisClient.setEx(
      cartKey,
      process.env.Redis_Expriation_Time,
      JSON.stringify(cart),
    );
  } else {
    cart = JSON.parse(cart);
  }
  return cart;
};

// add product to cart
exports.addCartItem = async (
  userId,
  productId,
  quantity,
  productPrice,
  productName,
  productQuantity,
) => {
  let mycart;
  const cartKey = `cart_${userId}`;
  // get cart from cache or database
  const cachedCart = await redisClient.get(cartKey);
  if (cachedCart) {
    mycart = JSON.parse(cachedCart);
  } else {
    mycart = await getOrCreate(Cart, { userId: userId }, { userId: userId });
  }
  // check if product already exists or not
  const item = mycart.items.find(
    (i) => i.productId.toString() === productId.toString(),
  );
  // if exists append on current product quantity
  if (item) {
    let newQuantity = Number(item.quantity) + Number(quantity);
    if (newQuantity > productQuantity) {
      throw new ApiError(`you can't order more than ${productQuantity} `, 400);
    }
    mycart.totalPrice -= item.piecePrice * item.quantity;
    mycart.totalPrice += productPrice * newQuantity;
    item.quantity = newQuantity;
    item.piecePrice = productPrice;
  } else {
    quantity = Number(quantity);
    mycart.items.push({
      productId,
      quantity,
      productName,
      piecePrice: productPrice,
    });
    mycart.totalPrice += productPrice * quantity;
  }
  // save changes in redis cache
  await redisClient.setEx(
    cartKey,
    Number(process.env.Redis_Expriation_Time),
    JSON.stringify(mycart),
  );
  return mycart;
};

// delete product from cart
exports.removeCartItem = async (cartId, productId) => {
  let cart = await Cart.findOne({
    _id: cartId,
    items: { $elemMatch: { productId: productId } },
  });
  if (cart) {
    // Find the item inside the array
    let item = cart.items.find(
      (i) => i.productId.toString() === productId.toString(),
    );
    let quantity = item.quantity;
    let productPrice = item.piecePrice;
    return Cart.findByIdAndUpdate(
      cartId,
      {
        $pull: {
          items: {
            productId,
          },
        },
        $inc: {
          totalPrice: productPrice * -quantity,
        },
      },
      { new: true },
    );
  } else {
    throw new ApiError(`product with ID:${productId} not exists in cart`, 404);
  }
};

// update product quantity in cart (increment or decrement 1)
exports.changeCartItemQuantity = async (cartId, productId, newQuantity) => {
  const cart = await Cart.findOne({
    _id: cartId,
    "items.productId": productId,
  });
  if (!cart) {
    throw new ApiError(`product with ID:${productId} not exists in cart`, 404);
  }
  const item = cart.items.find(
    (i) => i.productId.toString() === productId.toString(),
  );

  let changeInQuantity = newQuantity - item.quantity;

  const updatedCart = await Cart.findOneAndUpdate(
    {
      _id: cartId,
      "items.productId": productId,
    },
    {
      $inc: {
        "items.$.quantity": changeInQuantity,
        totalPrice: item.piecePrice * changeInQuantity,
      },
    },
    { new: true },
  );

  return updatedCart;
};

// clear cart in cache and mongoDB
exports.clearCart = async (userId) => {
  await redisClient.del(`cart_${userId}`);
  return Cart.findOneAndUpdate(
    { userId: userId },
    {
      $set: { items: [], totalPrice: 0 },
    },
    { new: true },
  );
};

// delete cart
exports.deleteCart = (cartId) => {
  return Cart.findByIdAndDelete(cartId);
};
