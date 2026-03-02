const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const redis = require("../config/redis.config");
const { getOrCreate } = require("../utils/jwtMethod");
const { cartQueue } = require("../utils/queues");
const { cacheRedis } = require("../utils/redis.methods");

async function saveCartJob(userId) {
  /* function to add/override a background job
  to save cart in DB before expiration in redis cache*/
  await cartQueue.add(
    "save-cart",
    { userId },
    {
      jobId: `cart-save-${userId}`,
      delay: (Number(process.env.Redis_Expriation_Time) - 4 * 60) * 1000,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

// create new cart for each user
exports.createCart = (data) => Cart.create(data);

// get cart by userId
exports.getCart = async (userId) => {
  const cartKey = `cart_${userId}`;
  // get cart from redis if it was cached
  let cart = await redis.get(cartKey);
  if (cart) {
    return JSON.parse(cart);
  }
  // if not get it from mongooDB
  cart = await getOrCreate(Cart, { userId }, { userId });
  // save cart in Redis
  let { items, totalPrice } = cart;
  await cacheRedis(
    cartKey,
    { items, totalPrice },
    Number(process.env.Redis_Expriation_Time),
  );
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
  // get cart
  let mycart = await this.getCart(userId);
  // check if product already exists in cart or not
  const key = productId.toString();
  const item = mycart.items[key];

  if (item) {
    const newQuantity = Number(item.quantity) + Number(quantity);
    if (newQuantity > productQuantity) {
      throw new ApiError(`You can't order more than ${productQuantity}`, 400);
    }

    mycart.totalPrice -= item.piecePrice * item.quantity;
    mycart.totalPrice += productPrice * newQuantity;

    item.quantity = newQuantity;
    item.piecePrice = productPrice;
  } else {
    quantity = Number(quantity);
    mycart.items[key] = {
      quantity,
      productName,
      piecePrice: productPrice,
    };

    mycart.totalPrice += productPrice * quantity;
  }
  // save in Redis
  let { items, totalPrice } = mycart;
  await cacheRedis(
    `cart_${userId}`,
    { items, totalPrice },
    Number(process.env.Redis_Expriation_Time),
  );
  // create job to save cart before expiration
  await saveCartJob(userId);
  return mycart;
};
// delete product from cart
exports.removeCartItem = async (userId, productId) => {
  // get chached cart, if not then from DB
  let cart = await this.getCart(userId);
  // Find the item inside the array
  let item = cart.items[productId.toString()];
  if (!item) {
    throw new ApiError(`product with ID:${productId} not exists in cart`, 404);
  }
  let quantity = item.quantity;
  let productPrice = item.piecePrice;
  delete cart.items[productId];
  cart.totalPrice -= productPrice * quantity;
  // save changes in redis cache
  let { items, totalPrice } = cart;
  await cacheRedis(
    `cart_${userId}`,
    { items, totalPrice },
    Number(process.env.Redis_Expriation_Time),
  );
  // create job to save cart before expiration
  await saveCartJob(userId);

  return cart;
};

// update product quantity in cart (increment or decrement 1)
exports.changeCartItemQuantity = async (
  userId,
  productId,
  newQuantity,
  productPrice,
) => {
  const cart = await this.getCart(userId);
  // Find the item inside the cart items
  let item = cart.items[productId.toString()];
  if (!item) {
    throw new ApiError(`product with ID:${productId} not exists in cart`, 404);
  }
  // check if there is an increase or decrease in cart product
  if (productPrice != item.piecePrice) {
    cart.totalPrice -= item.piecePrice * item.quantity;
    cart.totalPrice += productPrice * newQuantity;
    item.piecePrice = productPrice;
  } else {
    let changeInQuantity = newQuantity - item.quantity;
    cart.totalPrice += productPrice * changeInQuantity;
  }
  // set new quantity
  item.quantity = Number(newQuantity);
  // save in Redis
  let { items, totalPrice } = cart;
  await cacheRedis(
    `cart_${userId}`,
    { items, totalPrice },
    Number(process.env.Redis_Expriation_Time),
  );
  // create job to save cart before expiration
  await saveCartJob(userId);
  return cart;
};

// clear cart in cache and mongoDB
exports.clearCart = async (userId) => {
  await redis.del(`cart_${userId}`);
  return Cart.findOneAndUpdate(
    { userId: userId },
    {
      $set: { items: {}, totalPrice: 0 },
    },
    { new: true },
  );
};

// delete cart
exports.deleteCart = async (userId) => {
  await redis.del(`cart_${userId}`);
  return Cart.findOneAndDelete({ userId: userId });
};
