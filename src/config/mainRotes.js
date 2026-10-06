// all project routes
const categoryRout = require("../routes/category.Routes");
const brandRout = require("../routes/brand.Routes");
const productRout = require("../routes/product.Routes");
const userRout = require("../routes/userRoutes");
const cartRout = require("../routes/cartRoutes");
const couponRout = require("../routes/coupon.Routes");
const orderRout = require("../routes/order.routes");
const shippingCost = require("../routes/shipping.cost.Routes");
const plansRoutes = require("../routes/plan.routes");

const allRoutes = (app) => {
  app.use("/api/category", categoryRout);
  app.use("/api/brand", brandRout);
  app.use("/api/product", productRout);
  app.use("/api/users", userRout);
  app.use("/api/cart", cartRout);
  app.use("/api/coupon", couponRout);
  app.use("/api/order", orderRout);
  app.use("/api/shipping-cost", shippingCost);
  app.use("/api/plans", plansRoutes);
};

module.exports = allRoutes;
