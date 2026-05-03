const { Product, productVariation } = require("../models/productModel");
const { delCache, cacheRedis } = require("./redis.methods");
const ApiError = require("../utils/apiError");
const cartServ = require("../services/cart.service");
const prodServ = require("../services/product.service");
const couponServ = require("../services/coupon.service");
const { calcDiscountedPrice } = require("./calculate.discount");
const Order = require("../models/order.Model");
const ShippingRate = require("../models/shipping.cost.model");
const { saveCartJob } = require("../utils/queues");
const {
  createCheckoutSession,
  createPaymentIntent,
} = require("./stripe.methods");

// Constants for pricing (can be moved to config later)
const TAX_RATE = 0; // e.g., 0.1 for 10%

// calculate shipping cost based on location
exports.getShippingCost = async (req) => {
  const address = req.body?.address || req.user.address;
  if (!address || !address.city || !address.areaName) {
    throw new ApiError(
      "please add address first to calculate shipping cost",
      400,
    );
  }
  const city = address.city.trim().replace(/\s+/g, "-").toLowerCase();
  const area = address.areaName.trim().replace(/\s+/g, "-").toLowerCase();
  const shippingRate = await ShippingRate.findOne({
    $or: [{ city, area }, { city }, { city: "default" }],
  });
  return {
    shippingId: shippingRate.stripeShippingRateId,
    SHIPPING_COST: shippingRate.cost,
    address,
  };
};

const pushObject = function (bulkOptions, optionId, item, field, factor = -1) {
  const change = factor * item.quantity;
  bulkOptions.push({
    updateOne: {
      filter: { _id: optionId },
      update: { $inc: { [field]: change } },
    },
  });
  return bulkOptions;
};

// method to map order data to response format
const mapOrderToResponse = async (req, cart) => {
  const orderItems = [];
  let variationSellBulkOptions = [];
  let productSellBulkOptions = [];
  let variationRefundBulkOptions = [];
  let productRefundBulkOptions = [];
  const productIdsSet = new Set();
  const priceChanges = []; // Collect price discrepancies
  const insufficientQuantities = []; // Collect insufficient stock issues
  let totalPrice = 0;
  const line_items = [];

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
    let cost = item.quantity * Variation.piecePrice;
    totalPrice += cost;

    variationSellBulkOptions = pushObject(
      variationSellBulkOptions,
      variationId,
      item,
      "quantity",
    );
    variationRefundBulkOptions = pushObject(
      variationRefundBulkOptions,
      variationId,
      item,
      "quantity",
      1,
    );

    productSellBulkOptions = pushObject(
      productSellBulkOptions,
      productId,
      item,
      "sold",
      1,
    );
    productRefundBulkOptions = pushObject(
      productRefundBulkOptions,
      productId,
      item,
      "sold",
    );

    line_items.push({
      price_data: {
        currency: "egp",
        product_data: {
          name: item.productName,
          description: `color: ${Variation.attribute.color || "N/A"}, size: ${Variation.attribute.size || "N/A"}`,
        },
        unit_amount: Variation.piecePrice * 100, // Convert to cents
      },
      quantity: item.quantity,
      metadata: {
        productId,
        variationId,
        cost: cost * 100,
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

  return {
    orderItems,
    variationSellBulkOptions,
    productSellBulkOptions,
    productIdsSet,
    totalPrice,
    cart,
    line_items,
    variationRefundBulkOptions,
    productRefundBulkOptions,
  };
};

// method to calculate total price with discounts, taxes, and shipping
const calculateTotalPrice = async (
  SHIPPING_COST,
  userId,
  orderItems,
  cart,
  totalPrice,
  variationRefundBulkOptions,
  productRefundBulkOptions,
) => {
  let orderJson = {};
  // apply coupon if exists
  const subtotal = totalPrice; // Total before any discounts and taxes
  let discountAmount = 0;
  let couponCode = cart.coupon;
  if (couponCode) {
    couponCode = await couponServ.getByCode(couponCode);
    if (couponCode) {
      const originalTotal = totalPrice;
      totalPrice = calcDiscountedPrice(totalPrice, couponCode);
      discountAmount = originalTotal - totalPrice;

      orderJson.couponApplied = couponCode._id;
      orderJson.couponDiscount = couponCode.discount;
      orderJson.discountType = couponCode.type;
      orderJson.discountAmount = discountAmount;
    }
  }
  let totalAfterDiscount = totalPrice;

  // Calculate final total with tax and shipping
  const taxPrice = totalPrice * TAX_RATE;
  totalPrice += taxPrice + SHIPPING_COST;

  orderJson.subtotal = subtotal;
  orderJson.totalAfterDiscount = totalAfterDiscount;
  orderJson.taxPrice = taxPrice;
  orderJson.shippingPrice = SHIPPING_COST;
  orderJson.totalPrice = totalPrice;
  orderJson.userId = userId;
  orderJson.cartItems = orderItems;
  orderJson.variationRefundBulkOptions = variationRefundBulkOptions;
  orderJson.productRefundBulkOptions = productRefundBulkOptions;
  const PRICES = {
    subtotal: orderJson.subtotal,
    discountData: {
      couponApplied: couponCode?.code,
      couponDiscount: orderJson.couponDiscount,
      discountType: orderJson.discountType,
      discountAmount: orderJson.discountAmount,
      priceAfterDiscount: orderJson.totalAfterDiscount,
    },
    taxPrice: orderJson.taxPrice,
    shippingPrice: SHIPPING_COST,
    totalPrice: orderJson.totalPrice,
  };
  return { orderJson, PRICES };
};

// create order with different payment methods
exports.checkOut = async (req) => {
  const userId = req.user._id;
  // get cart items
  const mycart = await cartServ.getCart(userId);
  if (!mycart || Object.values(mycart.items).length === 0) {
    throw new ApiError("no cart found", 404);
  }
  const { shippingId, SHIPPING_COST, address } =
    await this.getShippingCost(req);
  let data;
  if (!mycart.paymentData) {
    // map order data to response format and validate
    let {
      orderItems,
      variationSellBulkOptions,
      productSellBulkOptions,
      productIdsSet,
      totalPrice,
      cart,
      line_items,
      variationRefundBulkOptions,
      productRefundBulkOptions,
    } = await mapOrderToResponse(req, mycart);

    // calculate total price with discounts, taxes, and shipping
    let { orderJson, PRICES } = await calculateTotalPrice(
      SHIPPING_COST,
      userId,
      orderItems,
      cart,
      totalPrice,
      variationRefundBulkOptions,
      productRefundBulkOptions,
    );

    orderJson.paymentMethod = req.headers["paymentmethod"] || "cach";
    // create order and update product quantities and sold counts in bulk
    let order = await Order.create(orderJson);
    await productVariation.bulkWrite(variationSellBulkOptions);
    await Product.bulkWrite(productSellBulkOptions);

    // cleanup product cache to keep catalog data fresh for next requests
    await Promise.all(
      [...productIdsSet].map((id) => delCache(`product_${id}`)),
    );
    // create payment data needed for Stripe checkout session/paymentIntent and cache it
    data = {
      line_items,
      orderId: order._id.toString(),
      shippingId,
      totalAmount: orderJson.totalPrice,
      currency: req.headers["currency"] || "egp",
      prices: PRICES,
      shippingAdress: address,
    };
    cart.paymentData = data;
    await cacheRedis(`cart_${userId}`, cart);
    await saveCartJob(userId);
  } else {
    data = mycart.paymentData;
  }
  switch (req.headers["paymentobject"]) {
    case "session":
      const session = await createCheckoutSession(data, req);
      return session;
    case "paymentintent":
      const paymentIntent = await createPaymentIntent(data);
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        items: data.line_items,
        prices: data.prices,
        address: data.shippingAdress,
      };
    default:
      await cartServ.deleteCart(userId); // Clear cart for cash payment
      return order; // For cash payment, return the created order details
  }
};
