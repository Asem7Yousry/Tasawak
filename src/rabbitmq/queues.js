// defines all system queues of rabbitMQ
const { getChannel } = require("../config/rabbitmq");

const ORDER_CREATED_QUEUE = "order.created.queue";
const PAYMENT_COMPLETED_QUEUE = "payment.completed.queue";

async function setupQueues() {
    const channel = getChannel();

    await channel.assertQueue(
        ORDER_CREATED_QUEUE,
        {
            durable: true
        }
    );

    await channel.assertQueue(
        PAYMENT_COMPLETED_QUEUE,
        {
            durable: true
        }
    );
}

module.exports = {
    ORDER_CREATED_QUEUE,
    PAYMENT_COMPLETED_QUEUE,
    setupQueues
};