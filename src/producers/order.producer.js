// src/producers/order.producer.js
const { getChannel } = require("../config/rabbitmq");

const { ORDER_EXCHANGE } = require("../rabbitmq/exchanges");

async function publishOrderCreated(order) {
  const channel = getChannel();

  const message = {
    // orderId: order._id,
    name: "Asem",
    age: 26,
    // userId: order.userId
  };
  channel.publish(
    ORDER_EXCHANGE,
    "order.created",
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
    },
  );
}

module.exports = {
  publishOrderCreated,
};
