const { connectRabbitMQ } = require("../config/rabbitmq");
const { setupExchanges } = require("./exchanges");
const { setupQueues } = require("./queues");
const { setupBindings } = require("./bindings");

async function startRabbitMQConfiguration() {
  await connectRabbitMQ();

  await setupExchanges();

  await setupQueues();

  await setupBindings();
}

module.exports = {
  startRabbitMQConfiguration,
};
