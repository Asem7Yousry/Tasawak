const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const { getOrCreate } = require("../utils/jwtMethod");
const { cartQueue } = require("../utils/queues");
const { cacheRedis, delCache, getCache } = require("../utils/redis.methods");

// create key for product in cart items
const getProductKey = (id, productColor, productSize) => {
  ColorString = productColor || "#";
  SizeString = productSize || "#";
  return `${id}_${ColorString}_${SizeString}`;
};

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
  let cart = await getCache(cartKey);
  if (cart) {
    return JSON.parse(cart);
  }
  // if not get it from mongooDB
  cart = await getOrCreate(Cart, { userId }, { userId });
  // save cart in Redis
  let { items, totalPrice } = cart;
  cart = { items, totalPrice };
  await cacheRedis(cartKey, cart, Number(process.env.Redis_Expriation_Time));
  return cart;
};

// add product to cart
exports.addCartItem = async (
  userId,
  quantity,
  productColor,
  productSize,
  product,
) => {
  // get cart
  let mycart = await this.getCart(userId);

  // create key for product
  const productKey = getProductKey(product._id, productColor, productSize);

  // check if product already exists in cart or not
  const item = mycart.items[productKey];
  if (item) {
    const newQuantity = Number(item.quantity) + Number(quantity);
    if (newQuantity > product.quantity) {
      throw new ApiError(`You can't order more than ${product.quantity}`, 400);
    }
    mycart.totalPrice -= item.piecePrice * item.quantity;
    mycart.totalPrice += product.price * newQuantity;

    item.quantity = newQuantity;
    item.piecePrice = product.price;
  } else {
    quantity = Number(quantity);
    let productName = product.name;
    let piecePrice = product.price;
    mycart.items[productKey] = {
      quantity,
      productName,
      productColor,
      productSize,
      piecePrice,
    };

    mycart.totalPrice += piecePrice * quantity;
  }
  // save in Redis
  await cacheRedis(
    `cart_${userId}`,
    mycart,
    Number(process.env.Redis_Expriation_Time),
  );
  // create job to save cart before expiration
  await saveCartJob(userId);
  return mycart;
};

// delete product from cart
exports.removeCartItem = async (
  userId,
  productId,
  productColor,
  productSize,
) => {
  // get chached cart, if not then from DB
  let cart = await this.getCart(userId);
  // Find the item inside the array
  const productKey = getProductKey(productId, productColor, productSize);
  let item = cart.items[productKey];
  if (!item) {
    throw new ApiError(`product not exists in cart`, 404);
  }
  let quantity = item.quantity;
  let productPrice = item.piecePrice;
  delete cart.items[productKey];
  cart.totalPrice -= productPrice * quantity;
  // save changes in redis cache
  await cacheRedis(
    `cart_${userId}`,
    cart,
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
  color,
  size,
) => {
  const cart = await this.getCart(userId);
  // Find the item inside the cart items
  const productKey = getProductKey(productId, color, size);
  let item = cart.items[productKey];
  if (!item) {
    throw new ApiError(`product not exists in cart`, 404);
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
  await cacheRedis(
    `cart_${userId}`,
    cart,
    Number(process.env.Redis_Expriation_Time),
  );
  // create job to save cart before expiration
  await saveCartJob(userId);
  return cart;
};

// clear cart in cache and mongoDB
exports.clearCart = async (userId) => {
  await delCache(`cart_${userId}`);
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
  await delCache(`cart_${userId}`);
  return Cart.findOneAndDelete({ userId: userId });
};
