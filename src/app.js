const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const ApiError = require("./utils/apiError");
const errorHandelingMiddleWare = require("./middlewares/errorMiddlWare");
const allRoutes = require("./config/mainRotes");
const getAllowedOriginsFromEnv = require("./utils/corsUtils");
require("dotenv").config();

// initialize express object
const app = express();

// middleware configuration
///// CORS configuration /////
const allowedOrigins = getAllowedOriginsFromEnv(process.env.CORS_ORIGINS); // Function to get allowed origins from environment variable
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (for example, server-to-server calls) are not CORS requests.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(compression());
app.set("trust proxy", 1);
app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook-completed") {
    next();
  } else {
    express.json({ limit: '50kb' })(req, res, next);
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
