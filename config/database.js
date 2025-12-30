const mongoose = require("mongoose");

// database configuration (MongoDB)
const DbConnection = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) =>
      console.log(`Successfully connected:${conn.connection.host}`)
    )
};

module.exports = DbConnection;