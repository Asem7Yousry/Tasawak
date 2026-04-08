const Order = require("../models/order.Model");
const { Product, productVariation } = require("../models/productModel");
const { delCache } = require("./redis.methods");
const ApiError = require("../utils/apiError");
const cartServ = require("../services/cart.service");
const prodServ = require("../services/product.service");
const couponServ = require("../services/coupon.service");
const { calcDiscountedPrice } = require("./calculate.discount");
const { createCheckoutSession } = require("./stripe.methods");

// Constants for pricing (can be moved to config later)
const TAX_RATE = 0; // e.g., 0.1 for 10%
const SHIPPING_COST = 20;

// create order with cash payment method
exports.checkOut = async (req) => {
  const userId = req.user._id;
  // get cart items
  const cart = await cartServ.getCart(userId);
  if (!cart || Object.values(cart.items).length === 0) {
    throw new ApiError("no cart found", 404);
  }

  const orderItems = [];
  const variationBulkOptions = [];
  const productBulkOptions = [];
  const productIdsSet = new Set();
  const priceChanges = []; // Collect price discrepancies
  const insufficientQuantities = []; // Collect insufficient stock issues
  let orderJson = {};
  let totalPrice = 0;

  // map cart items to order items and validate
  for (const key of Object.keys(cart.items)) {
    const item = cart.items[key];
    const [productId, variationId] = key.split("_");
    productIdsSet.add(productId);

    const product = await prodServ.getById(productId);
    const Variation = product.variations[variationId];

    if (!Variation) {
      throw new ApiError(`variation with ID ${variationId} not found`, 404);
    }

    // Check quantity availability
    if (item.quantity > Variation.quantity) {
      insufficientQuantities.push({
        productName: product.name,
        variationId,
        available: Variation.quantity,
        requested: item.quantity,
      });
      continue; // Skip this item
    }

    // Check for price changes
    if (item.piecePrice !== Variation.piecePrice) {
      priceChanges.push({
        productName: product.name,
        variationId,
        oldPrice: item.piecePrice,
        newPrice: Variation.piecePrice,
      });
      continue; // Skip adding to order items if price changed
    }

    orderItems.push({
      productId,
      variationId,
      price: Variation.piecePrice,
      quantity: item.quantity,
    });
    totalPrice += item.quantity * Variation.piecePrice;

    variationBulkOptions.push({
      updateOne: {
        filter: { _id: variationId },
        update: { $inc: { quantity: -item.quantity } },
      },
    });

    productBulkOptions.push({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { sold: item.quantity } },
      },
    });
  }

  // If any insufficient quantities, throw error with details
  if (insufficientQuantities.length > 0) {
    const messages = insufficientQuantities.map(
      (item) =>
        `${item.productName} (variation ${item.variationId}): requested ${item.requested}, available ${item.available}`,
    );
    throw new ApiError(
      `Insufficient quantities: ${messages.join("; ")}. Please adjust your cart.`,
      403,
    );
  }

  // If any price changes detected, throw error with details
  if (priceChanges.length > 0) {
    const changeMessages = priceChanges.map(
      (change) =>
        `${change.productName} (variation ${change.variationId}): ${change.oldPrice} → ${change.newPrice}`,
    );
    throw new ApiError(
      `Price changes detected: ${changeMessages.join("; ")}. Please review your cart.`,
      400,
    );
  }

  // apply coupon if exists
  const subtotal = totalPrice; // Total before any discounts and taxes
  let discountAmount = 0;
  let discountType = null;
  let totalAfterDiscount = totalPrice;

  let couponCode = cart.coupon;
  if (couponCode) {
    couponCode = await couponServ.getByCode(couponCode);
    if (couponCode) {
      const originalTotal = totalPrice;
      totalPrice = calcDiscountedPrice(totalPrice, couponCode);
      discountAmount = originalTotal - totalPrice;
      discountType = couponCode.type;
      totalAfterDiscount = totalPrice;

      orderJson.couponApplied = couponCode._id;
      orderJson.couponDiscount = couponCode.discount;
      orderJson.discountType = discountType;
      orderJson.discountAmount = discountAmount;
    }
  }

  // Calculate final total with tax and shipping
  const taxPrice = totalPrice * TAX_RATE;
  totalPrice += taxPrice + SHIPPING_COST;

  // orderJson.subtotal = subtotal;
  // orderJson.totalAfterDiscount = totalAfterDiscount;
  // orderJson.taxPrice = taxPrice;
  // orderJson.shippingPrice = SHIPPING_COST;
  // orderJson.totalPrice = totalPrice;
  // orderJson.userId = userId;
  // orderJson.cartItems = orderItems;

  // // create order
  // const order = await Order.create(orderJson);

  // // update inventory
  // await productVariation.bulkWrite(variationBulkOptions);
  // await Product.bulkWrite(productBulkOptions);

  // // cleanup
  // productIdsSet.forEach((id) => delCache(`product_${id}`));
  // await cartServ.deleteCart(userId);

  // return order;
  const name = req.user.fullName.first_name;
  const email = req.user.email;
  const cartId = String(cart._id);
  const data = {
    totalPrice,
    name,
    email,
    cartId,
  };
  const session = await createCheckoutSession(data, req);
  return session;
};
