const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const ENV = require("dotenv");
const ApiError = require("./utils/apiError");
const errorHandelingMiddleWare = require("./middlewares/errorMiddlWare");
const allRoutes = require("./config/mainRotes");

ENV.config();

// initialize express object
const app = express();

// middleware configuration
app.use(cors());
app.use(compression());
app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook-completed") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// tell express to parse (read) query string nestedly from urls
app.set("query parser", "extended");

// project Basic routes
allRoutes(app);

// handel error of request on unexisted route
app.all("/*path", (req, res, next) => {
  next(new ApiError(`can't find route: ${req.originalUrl}`, 404));
});

// error handlling middleware for express
app.use(errorHandelingMiddleWare);

module.exports = app;
