jest.mock("../src/models/order.Model", () => ({
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
}));
jest.mock("../src/producers/order.producer", () => ({ publishOrderEvent: jest.fn() }));

const Order = require("../src/models/order.Model");
const { publishOrderEvent } = require("../src/producers/order.producer");
const PaymentLifecycle = require("../src/payments/payment.lifecycle");

describe("payment lifecycle", () => {
  beforeEach(() => jest.clearAllMocks());

  test("success records paid and pending fulfillment once", async () => {
    const order = { _id: "o1", userId: "u1", totalPrice: 10 };
    Order.findOneAndUpdate.mockResolvedValue(order);
    await PaymentLifecycle.markPaid({ orderId: "o1", paymentId: "pi1", provider: "stripe" });
    expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "o1", isPaid: { $ne: true }, status: { $ne: "canceled" } },
      { $set: expect.objectContaining({ isPaid: true, paymentStatus: "paid", status: "shipped", paymentId: "pi1" }) },
      { new: true },
    );
    expect(publishOrderEvent).toHaveBeenCalledTimes(1);
    expect(publishOrderEvent).toHaveBeenCalledWith("payment.success", expect.any(Object));
  });

  test("failure cannot change an already paid order", async () => {
    Order.findOneAndUpdate.mockResolvedValue(null);
    const paidOrder = { _id: "o1", isPaid: true };
    Order.findById.mockResolvedValue(paidOrder);
    await expect(PaymentLifecycle.markFailed({ orderId: "o1", paymentId: "pi1", provider: "stripe" })).resolves.toBe(paidOrder);
    expect(publishOrderEvent).not.toHaveBeenCalled();
  });

  test("duplicate success does not publish another event", async () => {
    Order.findOneAndUpdate.mockResolvedValue(null);
    const order = { _id: "o1", isPaid: true };
    Order.findById.mockResolvedValue(order);
    await PaymentLifecycle.markPaid({ orderId: "o1", paymentId: "pi1", provider: "stripe" });
    expect(publishOrderEvent).not.toHaveBeenCalled();
  });
});
