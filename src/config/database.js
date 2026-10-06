const mongoose = require("mongoose");

// database configuration (MongoDB)
const DbConnection = () => {
  return mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log(`Successfully connected to MongoDB`));
};

module.exports = DbConnection;
