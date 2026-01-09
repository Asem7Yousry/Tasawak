const express = require("express");
const ENV = require("dotenv");
const morgan = require("morgan");
const DbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const errorHandellingMiddleWare = require("./middlewares/errorMiddlWare");
const allRoutes = require("./config/mainRotes")

ENV.config();

// some constants
const app = express();

// connect to database (MongoDB)
DbConnection();

// middleware configuration
app.use(express.json());
app.use(express.urlencoded());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// tell express to parse (read) query string nestedly from urls
app.set("query parser","extended") 

// project Basic routes
allRoutes(app)

// handel error of request on unexisted route
app.all("/*path", (req, res, next) => {
  next(new ApiError(`can't find route: ${req.originalUrl}`, 404));
});

// error handlling middleware for express
app.use(errorHandellingMiddleWare);

// running server
const SERVER = app.listen(process.env.PORT || 8000, (_) =>
  console.log(`server running...`)
);

// rejection error handelling
process.on("unhandledRejection", (error) => {
  console.log(`unhandled Rejection Error: ${error}`);
  SERVER.close((_) => {
    console.log("Shutting down...");
    process.exit(1);
  });
});
