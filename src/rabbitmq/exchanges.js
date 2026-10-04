// all exchanges(queue routers) in system 
const { getChannel } = require("../config/rabbitmq");

const ORDER_EXCHANGE = "order.exchange";
const PAYMENT_EXCHANGE = "payment.exchange";

async function setupExchanges() {
    const channel = getChannel();

    await channel.assertExchange(
        ORDER_EXCHANGE,
        "topic",
        {
            durable: true
        }
    );

    await channel.assertExchange(
        PAYMENT_EXCHANGE,
        "topic",
        {
            durable: true
        }
    );
}

module.exports = {
    ORDER_EXCHANGE,
    PAYMENT_EXCHANGE,
    setupExchanges
};