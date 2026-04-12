const express = require("express");
const ENV = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const ApiError = require("./utils/apiError");
const errorHandellingMiddleWare = require("./middlewares/errorMiddlWare");
const allRoutes = require("./config/mainRotes");
const cors = require("cors");
const compression = require("compression");

ENV.config();

// some constants
const app = express();
// middleware configuration
app.use(cors());
app.use(compression());
// app.use(express.json());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/order/webhook-completed') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded());
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
app.use(errorHandellingMiddleWare);

module.exports = app;
