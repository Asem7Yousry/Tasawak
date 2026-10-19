jest.mock("../src/config/rabbitmq", () => ({ getChannel: jest.fn() }));
const { getChannel } = require("../src/config/rabbitmq");
const { setupBindings } = require("../src/rabbitmq/bindings");
const { setupQueues, ORDER_CANCEL_DELAY_QUEUE, ORDER_CANCEL_QUEUE, ORDER_CANCEL_DELAY_MS } = require("../src/rabbitmq/queues");

describe("order queue configuration", () => {
  let channel;
  beforeEach(() => {
    channel = { assertQueue: jest.fn().mockResolvedValue({}), bindQueue: jest.fn().mockResolvedValue({}) };
    getChannel.mockReturnValue(channel);
  });

  test("declares durable 72-hour cancellation queue with order dead-letter route", async () => {
    await setupQueues();
    expect(channel.assertQueue).toHaveBeenCalledWith(ORDER_CANCEL_DELAY_QUEUE, {
      durable: true,
      arguments: {
        "x-message-ttl": ORDER_CANCEL_DELAY_MS,
        "x-dead-letter-exchange": "order.exchange",
        "x-dead-letter-routing-key": "order.cancel",
      },
    });
    expect(channel.assertQueue).toHaveBeenCalledWith(ORDER_CANCEL_QUEUE, { durable: true });
  });

  test("binds delayed and ready cancellation routes", async () => {
    await setupBindings();
    expect(channel.bindQueue).toHaveBeenCalledWith(ORDER_CANCEL_DELAY_QUEUE, "order.exchange", "order.cancel.delay");
    expect(channel.bindQueue).toHaveBeenCalledWith(ORDER_CANCEL_QUEUE, "order.exchange", "order.cancel");
    expect(channel.bindQueue).toHaveBeenCalledWith("payment.completed.queue", "payment.exchange", "payment.#");
  });
});
