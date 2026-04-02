const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const { saveCartJob } = require("../utils/queues");
const { cacheRedis, delCache, getCache } = require("../utils/redis.methods");

// create key for product in cart items
const getProductKey = (id, variationId = "") => {
  return `${id}_${variationId}`;
};

// create new cart for each user
exports.createCart = (data) => Cart.create(data);

// get cart by userId
exports.getCart = async (userId) => {
  const cartKey = `cart_${userId}`;
  // get cart from redis if it was cached
  let cart = await getCache(cartKey);
  if (cart) {
    return cart;
  }
  // if not get it from mongooDB
  cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await this.createCart({ userId });
  }
  // save cart in Redis
  let { items, totalPrice } = cart;
  cart = { items, totalPrice };
  await cacheRedis(cartKey, cart);
  return cart;
};

// add product to cart
exports.addCartItem = async (userId, quantity, variationId, product) => {
  // get cart
  let mycart = await this.getCart(userId);

  // create key for product
  const productKey = getProductKey(product._id, variationId);

  // check if product already exists in cart or not
  const item = mycart.items[productKey];
  if (item) {
    const newQuantity = Number(item.quantity) + Number(quantity);
    if (newQuantity > product.variations[variationId].quantity) {
      throw new ApiError(
        `You can't order more than ${product.variations[variationId].quantity}`,
        400,
      );
    }
    mycart.totalPrice -= item.piecePrice * item.quantity;
    mycart.totalPrice +=
      product.variations[variationId].peacePrice * newQuantity;

    item.quantity = newQuantity;
    item.piecePrice = product.variations[variationId].peacePrice;
  } else {
    quantity = Number(quantity);
    let productName = product.name;
    let piecePrice = product.variations[variationId].peacePrice;
    mycart.items[productKey] = {
      quantity,
      productName,
      piecePrice,
    };

    mycart.totalPrice += piecePrice * quantity;
  }
  // save in Redis
  await cacheRedis(`cart_${userId}`, mycart);
  // create job to save cart before expiration
  await saveCartJob(userId);
  return mycart;
};

// delete product from cart
exports.removeCartItem = async (userId, productId, variationId) => {
  // get chached cart, if not then from DB
  let cart = await this.getCart(userId);
  // Find the item inside the array
  const productKey = getProductKey(productId, variationId);
  let item = cart.items[productKey];
  if (!item) {
    throw new ApiError(`product variation not exists in cart`, 404);
  }
  let quantity = item.quantity;
  let productPrice = item.piecePrice;
  delete cart.items[productKey];
  cart.totalPrice -= productPrice * quantity;
  // save changes in redis cache
  await cacheRedis(`cart_${userId}`, cart);
  // create job to save cart before expiration
  await saveCartJob(userId);
  return cart;
};

// update product quantity in cart (increment or decrement 1)
exports.changeCartItemQuantity = async (
  userId,
  productId,
  variationId,
  newQuantity,
  product,
) => {
  const cart = await this.getCart(userId);
  // Find the item inside the cart items
  const productKey = getProductKey(productId, variationId);
  let item = cart.items[productKey];
  if (!item) {
    throw new ApiError(`product variation not exists in cart`, 404);
  }
  const price = product.variations[variationId].peacePrice;
  // check if there is an increase or decrease in cart product
  if (price != item.piecePrice) {
    cart.totalPrice -= item.piecePrice * item.quantity;
    cart.totalPrice += price * newQuantity;
    item.piecePrice = price;
  } else {
    let changeInQuantity = newQuantity - item.quantity;
    cart.totalPrice += price * changeInQuantity;
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
  const myCart = await Cart.findOneAndUpdate(
    { userId },
    {
      $set: { items: {}, totalPrice: 0 },
    },
    { new: true },
  );
  if (!myCart) {
    throw new ApiError("no cart found", 404);
  }
  return myCart;
};

// delete cart
exports.deleteCart = async (userId) => {
  await delCache(`cart_${userId}`);
  return Cart.findOneAndDelete({ userId: userId });
};
