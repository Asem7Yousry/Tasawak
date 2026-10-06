const DbConnection = require("./config/database");
const { setupConsumers } = require("./consumers/setup.consumers");

DbConnection()
  .then(() => {
    return setupConsumers();
  })
  .then(() => {
  })
  .catch((err) => {
    process.exit(1);
  });
