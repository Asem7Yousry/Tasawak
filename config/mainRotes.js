// all project routes
const categoryRout = require("../routes/category.Routes");
const subCategoryRout = require("../routes/subCategory.Routes");
const brandRout = require("../routes/brand.Routes");
const productRout = require("../routes/product.Routes");
const userRout = require("../routes/userRoutes");
const cartRout = require("../routes/cartRoutes");
const couponRout = require("../routes/coupon.Routes");

const allRoutes = (app) => {
  app.use("/api/category", categoryRout);
  app.use("/api/subCategory", subCategoryRout);
  app.use("/api/brand", brandRout);
  app.use("/api/product", productRout);
  app.use("/api/users", userRout);
  app.use("/api/cart", cartRout);
  app.use("/api/coupon", couponRout);
};

module.exports = allRoutes;
