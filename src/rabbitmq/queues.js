// defines all system queues of rabbitMQ
const { getChannel } = require("../config/rabbitmq");
const { CART_MAIN_EXCHANGE, ORDER_EXCHANGE } = require("./exchanges");

const ORDER_CREATED_QUEUE = "order.created.queue";
const PAYMENT_COMPLETED_QUEUE = "payment.completed.queue";
const CART_DELAY_QUEUE = "cart.delay.queue";
const CART_MAIN_QUEUE = "cart.main.queue";
const ORDER_CANCEL_DELAY_QUEUE = "order.cancel.delay.queue";
const ORDER_CANCEL_QUEUE = "order.cancel.queue";
const ORDER_CANCEL_DELAY_MS = 72 * 60 * 60 * 1000;

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

    await channel.assertQueue(ORDER_CANCEL_DELAY_QUEUE, {
        durable: true,
        arguments: {
            "x-message-ttl": ORDER_CANCEL_DELAY_MS,
            "x-dead-letter-exchange": ORDER_EXCHANGE,
            "x-dead-letter-routing-key": "order.cancel",
        },
    });

    await channel.assertQueue(ORDER_CANCEL_QUEUE, { durable: true });

    await channel.assertQueue(
        CART_DELAY_QUEUE,
        {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": CART_MAIN_EXCHANGE,
                "x-dead-letter-routing-key": "cart.update"
            }
        }
    );

    await channel.assertQueue(
        CART_MAIN_QUEUE,
        {
            durable: true
        }
    );
}

module.exports = {
    ORDER_CREATED_QUEUE,
    PAYMENT_COMPLETED_QUEUE,
    CART_DELAY_QUEUE,
    CART_MAIN_QUEUE,
    ORDER_CANCEL_DELAY_QUEUE,
    ORDER_CANCEL_QUEUE,
    ORDER_CANCEL_DELAY_MS,
    setupQueues
};
