const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const { saveCartJob } = require("../utils/queues");
const { cacheRedis, delCache, getCache } = require("../utils/redis.methods");
const {publishOrderCreated} = require("../producers/order.producer");

// to get variation from product
const getVariation = (product, variationId, newQuantity) => {
  // extract variation from product
  const variation = product.variations.find(
    (variation) => variation._id.toString() === variationId,
  );
  if (!variation) {
    throw new ApiError("variation not belong to product", 400);
  }
  if (newQuantity > variation.quantity) {
    throw new ApiError(`You can't order more than ${variation.quantity}`, 400);
  }
  return variation;
};

// create new cart for each user
exports.createCart = (data) => Cart.create(data);

// get cart by userId
exports.getCart = async (userId) => {
  const cartKey = `cart_${userId}`;
  // get cart from redis if it was cached
  let cart = await getCache(cartKey);
  if (!cart) {
    // if not get it from mongooDB
    cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await this.createCart({ userId });
    }
    let { createdAt, updatedAt, __v, ...restCart } = cart["_doc"];
    cart = restCart;
  }
  // check if cart has already not paied order
  if (cart.paymentData) {
    throw new ApiError(
      "You have an unpaid order. Please complete the payment before adding more items.",
      400,
    );
  }
  // save cart in Redis
  await cacheRedis(cartKey, cart);
  await publishOrderCreated(cart);
  return cart;
};

// add product to cart
exports.addCartItem = async (userId, variationId, product, quantity = 1) => {
  // get cart
  let cart = await this.getCart(userId);
  // extract variation from product
  const variation = getVariation(product, variationId, quantity);
  // check if product already exists in cart or not
  const item = cart.items[variationId];
  if (item) {
    const newQuantity = Number(item.quantity) + Number(quantity);
    if (newQuantity > variation.quantity) {
      throw new ApiError(
        `You can't order more than ${variation.quantity}`,
        400,
      );
    }
    cart.subtotal -= item.piecePrice * item.quantity;
    cart.subtotal += variation.piecePrice * newQuantity;
    cart.totalPrice -= item.piecePrice * item.quantity;
    cart.totalPrice += variation.piecePrice * newQuantity;

    item.quantity = newQuantity;
    item.piecePrice = variation.piecePrice;
  } else {
    quantity = Number(quantity);
    const productName = product.name;
    const piecePrice = variation.piecePrice;
    const attribute = variation.attribute;
    cart.items[variationId] = {
      quantity,
      productName,
      piecePrice,
      attribute,
    };
    cart.subtotal += piecePrice * quantity;
    cart.totalPrice += piecePrice * quantity;
  }
  // await Cart.findByIdAndUpdate(cart._id, cart);
  // save in Redis
  await cacheRedis(`cart_${userId}`, cart);
  // create job to save cart before expiration
  await saveCartJob(userId);
  return cart;
};

// delete product from cart
exports.removeCartItem = async (userId, variationId) => {
  // get chached cart, if not then from DB
  let cart = await this.getCart(userId);
  // Find the item inside the array
  let item = cart.items[variationId];
  if (!item) {
    throw new ApiError(`product variation not exists in cart`, 404);
  }
  const quantity = item.quantity;
  const productPrice = item.piecePrice;
  delete cart.items[variationId];
  cart.subtotal -= productPrice * quantity;
  cart.totalPrice -= productPrice * quantity;
  // await Cart.findByIdAndUpdate(cart._id, cart);
  // save changes in redis cache
  await cacheRedis(`cart_${userId}`, cart);
  // create job to save cart before expiration
  await saveCartJob(userId);
  return cart;
};

// update product quantity in cart (increment or decrement 1)
exports.changeCartItemQuantity = async (
  userId,
  variationId,
  product,
  newQuantity,
) => {
  const cart = await this.getCart(userId);
  // Find the item inside the cart items
  let item = cart.items[variationId];
  if (!item) {
    throw new ApiError(`product variation not exists in cart`, 404);
  }
  // extract variation from product
  const variation = getVariation(product, variationId, newQuantity);
  const variationPrice = variation.piecePrice;
  // check if there is an increase or decrease in cart product
  if (variationPrice != item.piecePrice) {
    cart.subtotal -= item.piecePrice * item.quantity;
    cart.subtotal += variationPrice * newQuantity;
    cart.totalPrice -= item.piecePrice * item.quantity;
    cart.totalPrice += variationPrice * newQuantity;
    item.piecePrice = variationPrice;
  } else {
    let changeInQuantity = newQuantity - item.quantity;
    cart.subtotal += variationPrice * changeInQuantity;
    cart.totalPrice += variationPrice * changeInQuantity;
  }
  // set new quantity
  item.quantity = Number(newQuantity);
  // await Cart.findByIdAndUpdate(cart._id, cart);
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
  const cart = await Cart.findOneAndUpdate(
    { userId },
    {
      $set: {
        items: {},
        totalPrice: 0,
        subtotal: 0,
      },
      $unset: {
        address: "",
        shippingPrice: "",
        couponCode: "",
        couponDiscount: "",
        couponId: "",
        discountAmount: "",
        discountType: "",
        totalAfterDiscount: "",
      },
    },
    { new: true },
  );
  if (!cart) {
    throw new ApiError("no cart found", 404);
  }
  return cart;
};

// delete cart
exports.deleteCart = async (userId) => {
  await delCache(`cart_${userId}`);
  return Cart.findOneAndDelete({ userId });
};

// update cart by id
exports.updateByUserId = async (userId, update) => {
  const cart = await this.getCart(userId);
  Object.assign(cart, update);
  await cacheRedis(`cart_${userId}`, cart);
  await Cart.findByIdAndUpdate(cart._id, update, {
    new: true,
    runValidators: true,
  });
  return cart;
};

exports.updateById = (id, updates) =>
  Cart.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
