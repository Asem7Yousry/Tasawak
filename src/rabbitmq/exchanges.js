// all exchanges(queue routers) in system 
const { getChannel } = require("../config/rabbitmq");

const ORDER_EXCHANGE = "order.exchange";
const PAYMENT_EXCHANGE = "payment.exchange";
const CART_DELAY_EXCHANGE = "cart.delay.exchange";
const CART_MAIN_EXCHANGE = "cart.main.exchange";

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

    await channel.assertExchange(
        CART_DELAY_EXCHANGE,
        "direct",
        {
            durable: true
        }
    );

    await channel.assertExchange(
        CART_MAIN_EXCHANGE,
        "direct",
        {
            durable: true
        }
    );
}

module.exports = {
    ORDER_EXCHANGE,
    PAYMENT_EXCHANGE,
    CART_DELAY_EXCHANGE,
    CART_MAIN_EXCHANGE,
    setupExchanges
};