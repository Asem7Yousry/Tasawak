// defines all system queues of rabbitMQ
const { getChannel } = require("../config/rabbitmq");
const { CART_EXCHANGE, ORDER_EXCHANGE } = require("./exchanges");

const EMAIL_QUEUE = "email.queue";
// inventory and payment 
const INVENTORY_RESTORE_QUEUE = "inventory.restore.queue";
const PAYMENT_REFUND_QUEUE = "payment.refund.queue";
/// cart queues ////
const CART_DELETE_QUEUE = "cart.delete.queue";
const CART_DELAY_QUEUE = "cart.delay.queue";
const CART_MAIN_QUEUE = "cart.main.queue";
//// order queues /////
const ORDER_FAILED_PAY_DELAY_QUEUE = "order.failed.pay.delay.queue";
const ORDER_UPDATE_QUEUE = "order.update.queue";

const ORDER_CANCEL_DELAY_MS = Number(process.env.ORDER_CANCEL_DELAY_MS);

async function setupQueues() {
    const channel = getChannel();

    await channel.assertQueue(EMAIL_QUEUE, { durable: true });

    await channel.assertQueue(INVENTORY_RESTORE_QUEUE, { durable: true });

    await channel.assertQueue(PAYMENT_REFUND_QUEUE, { durable: true });

    await channel.assertQueue(CART_DELETE_QUEUE, { durable: true });

    await channel.assertQueue(
        CART_DELAY_QUEUE,
        {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": CART_EXCHANGE,
                "x-dead-letter-routing-key": "cart.update"
            }
        }
    );

    await channel.assertQueue(CART_MAIN_QUEUE, { durable: true });

    await channel.assertQueue(
        ORDER_FAILED_PAY_DELAY_QUEUE,
        {
            durable: true,
            arguments: {
                "x-message-ttl": ORDER_CANCEL_DELAY_MS,
                "x-dead-letter-exchange": ORDER_EXCHANGE,
                "x-dead-letter-routing-key": "inventory.restore",
            },
        }
    );

    await channel.assertQueue(ORDER_UPDATE_QUEUE, { durable: true });
}

module.exports = {
    EMAIL_QUEUE,
    INVENTORY_RESTORE_QUEUE,
    PAYMENT_REFUND_QUEUE,
    CART_DELETE_QUEUE,
    CART_DELAY_QUEUE,
    CART_MAIN_QUEUE,
    ORDER_UPDATE_QUEUE,
    ORDER_FAILED_PAY_DELAY_QUEUE,

    ORDER_CANCEL_DELAY_MS,
    setupQueues
};
