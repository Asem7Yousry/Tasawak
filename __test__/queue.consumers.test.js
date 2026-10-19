jest.mock("../src/config/rabbitmq", () => ({ getChannel: jest.fn() }));
jest.mock("../src/models/order.Model", () => ({}));
jest.mock("../src/utils/orderNotifications", () => ({ notify: jest.fn() }));
jest.mock("../src/services/order.queue.service", () => ({ cancelIfUnpaid: jest.fn() }));
jest.mock("../src/utils/redis.methods", () => ({ delCache: jest.fn() }));
jest.mock("../src/services/cart.service", () => ({ deleteCart: jest.fn() }));

const { getChannel } = require("../src/config/rabbitmq");
const { notify } = require("../src/utils/orderNotifications");
const { deleteCart } = require("../src/services/cart.service");
const { startOrderConsumer } = require("../src/consumers/order.consumer");
const { startPaymentConsumer } = require("../src/consumers/payment.consumer");

describe("queue consumer acknowledgments", () => {
  let channel;
  let handlers;
  beforeEach(() => {
    jest.clearAllMocks();
    handlers = {};
    channel = {
      consume: jest.fn(async (queue, handler) => { handlers[queue] = handler; }),
      ack: jest.fn(),
      nack: jest.fn(),
    };
    getChannel.mockReturnValue(channel);
  });

  test("does not acknowledge an order before email and cache work succeeds", async () => {
    await startOrderConsumer();
    const message = { content: Buffer.from(JSON.stringify({ eventName: "order.created", order: { _id: "o1", items: {} }, userEmail: "buyer@example.test" })) };
    notify.mockRejectedValueOnce(new Error("mail failed"));
    await handlers["order.created.queue"](message);
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
  });

  test("requeues payment success on email failure without clearing the cart", async () => {
    await startPaymentConsumer();
    const message = { content: Buffer.from(JSON.stringify({ eventName: "payment.success", userId: "u1", orderId: "o1" })) };
    notify.mockRejectedValueOnce(new Error("mail failed"));
    await handlers["payment.completed.queue"](message);
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    expect(deleteCart).not.toHaveBeenCalled();
  });
});
