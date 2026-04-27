const mongoose = require("mongoose");

// database configuration (MongoDB)
const DbConnection = () => {
  return (
    mongoose
      .connect(process.env.DB_URI)
      .then(() => console.log(`Successfully connected to MongoDB`))
  );
};

// // database configuration (MongoDB)
// const DbConnection = () => {
//   let MONGO_URI;
//   if (process.env.NODE_ENV === "development") {
//     MONGO_URI = "mongodb://127.0.0.1:27017/tasawak";
//   } else {
//     MONGO_URI = process.env.DB_URI;
//   }
//   return (
//     mongoose
//       .connect(MONGO_URI)
//       .then(() => console.log(`Successfully connected to MongoDB`))
//   );
// };

module.exports = DbConnection;
