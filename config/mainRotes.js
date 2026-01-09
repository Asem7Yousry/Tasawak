// all project routes
const categoryRout = require("../routes/categoryRoutes");
const subCategoryRout = require("../routes/subCategoryRoutes");
const brandRout = require("../routes/brandRoutes");
const productRout = require("../routes/productRoutes");
const userRout = require("../routes/userRoutes");

const allRoutes = (app) => {
  app.use("/api/category", categoryRout);
  app.use("/api/subCategory", subCategoryRout);
  app.use("/api/brand", brandRout);
  app.use("/api/product", productRout);
  app.use("/api/users", userRout);
};

module.exports = allRoutes;
