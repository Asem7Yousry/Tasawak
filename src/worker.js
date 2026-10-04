const {
  startRabbitMQConfiguration,
} = require("./rabbitmq/setup");
const { startOrderConsumer } = require("./consumers/order.consumer");

async function startWorker() {
  await startRabbitMQConfiguration();
  await startOrderConsumer();
  console.log("Worker consumer started...");
}

startWorker();
