const DbConnection = require("./config/database");
const app = require("./app");

DbConnection()
  .then(() => {
    // run all workers
    require("./utils/workers");
    // // running server
    const SERVER = app.listen(process.env.PORT || 8000, (_) =>
      console.log(`server running...`),
    );

    // rejection error handelling
    process.on("unhandledRejection", (error) => {
      console.log(`unhandled Rejection Error: ${error}`);
      SERVER.close((_) => {
        console.log("Shutting down...");
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
