const mongoose = require("mongoose");

// database configuration (MongoDB)
const DbConnection = () => {
  return (
    console.log(`Connection string ${process.env.DB_URI}`),
    mongoose
      .connect(process.env.DB_URI)
      // .connect("mongodb://127.0.0.1:27017/tasawak")
      .then(() => console.log(`Successfully connected to MongoDB`))
  );
};

module.exports = DbConnection;
