const { startRabbitMQConfiguration } = require("../rabbitmq/setup");
const { startOrderConsumer } = require("./order.consumer");
const { startCartConsumer } = require("./cart.consumer");
const { startPaymentConsumer } = require("./payment.consumer");
const { startEmailConsumer } = require("./email.consumer");

exports.setupConsumers = async () => {
  await startRabbitMQConfiguration();
  await startOrderConsumer();
  await startPaymentConsumer();
  await startCartConsumer();
  await startEmailConsumer();
};
