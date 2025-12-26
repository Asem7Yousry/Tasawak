const express = require("express");
const ENV = require("dotenv");
const morgan = require("morgan");
const DbConnection = require("./config/database");
const categoryRout = require("./routes/categoryRoutes");

ENV.config();

// some constants
const app = express();
const ServerPort = process.env.PORT || 8000;

// middleware config
app.use(express.json());
app.use(express.urlencoded());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// connect to database (MongoDB)
DbConnection();

// project Basic routes
app.use("/api/category", categoryRout);

// running server
app.listen(ServerPort, (_) => console.log(`server running...`));
