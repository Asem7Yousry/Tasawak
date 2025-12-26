const mongoose = require("mongoose");

// database configuration (MongoDB)
const DbConnection = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) =>
      console.log(`Successfully connected:${conn.connection.host}`)
    )
    .catch((error) => {
      console.log(`error in conncetion to MongDB:${error}`);
      process.exit(1);
    });
};

module.exports = DbConnection;