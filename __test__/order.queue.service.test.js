jest.mock("../src/models/order.Model", () => ({
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
}));
jest.mock("../src/models/productModel", () => ({ productVariation: { updateOne: jest.fn() } }));
jest.mock("mongoose", () => ({
  startSession: jest.fn(),
}));

const mongoose = require("mongoose");
const Order = require("../src/models/order.Model");
const { productVariation } = require("../src/models/productModel");
const OrderQueueService = require("../src/services/order.queue.service");

describe("delayed unpaid order cancellation", () => {
  let session;
  beforeEach(() => {
    jest.clearAllMocks();
    session = { withTransaction: jest.fn(async (callback) => callback()), endSession: jest.fn() };
    mongoose.startSession.mockResolvedValue(session);
    productVariation.updateOne.mockResolvedValue({ matchedCount: 1 });
  });

  test("cancels an eligible order and restores each variation's exact quantity", async () => {
    const order = {
      _id: "o1",
      items: {
        a: { variationId: "v1", quantity: 2 },
        b: { variationId: "v1", quantity: 3 },
        c: { variationId: "v2", quantity: 1 },
      },
    };
    Order.findOneAndUpdate.mockResolvedValue(order);
    await expect(OrderQueueService.cancelIfUnpaid("o1", new Date("2026-10-10"))).resolves.toBe(order);
    expect(productVariation.updateOne).toHaveBeenNthCalledWith(1, { _id: "v1" }, { $inc: { quantity: 5 } }, { session });
    expect(productVariation.updateOne).toHaveBeenNthCalledWith(2, { _id: "v2" }, { $inc: { quantity: 1 } }, { session });
    expect(session.endSession).toHaveBeenCalled();
  });

  test("does not restore stock if the order is no longer eligible", async () => {
    Order.findOneAndUpdate.mockResolvedValue(null);
    Order.findById.mockResolvedValue({ _id: "o1", isPaid: true });
    await expect(OrderQueueService.cancelIfUnpaid("o1", new Date("2026-10-10"))).resolves.toBeNull();
    expect(productVariation.updateOne).not.toHaveBeenCalled();
  });

  test("concurrent timeout deliveries restore stock only once", async () => {
    const canceled = { _id: "o1", cancellationReason: "unpaid_timeout", items: { a: { variationId: "v1", quantity: 4 } } };
    Order.findOneAndUpdate.mockResolvedValueOnce(canceled).mockResolvedValueOnce(null);
    Order.findById.mockResolvedValue(canceled);
    const results = await Promise.all([
      OrderQueueService.cancelIfUnpaid("o1", new Date("2026-10-10")),
      OrderQueueService.cancelIfUnpaid("o1", new Date("2026-10-10")),
    ]);
    expect(results).toEqual([canceled, canceled]);
    expect(productVariation.updateOne).toHaveBeenCalledTimes(1);
    expect(productVariation.updateOne).toHaveBeenCalledWith({ _id: "v1" }, { $inc: { quantity: 4 } }, { session });
  });

  test("rolls back cancellation if a variation cannot be restored", async () => {
    Order.findOneAndUpdate.mockResolvedValue({ _id: "o1", items: { a: { variationId: "missing", quantity: 2 } } });
    productVariation.updateOne.mockResolvedValue({ matchedCount: 0 });
    await expect(OrderQueueService.cancelIfUnpaid("o1", new Date("2026-10-10"))).rejects.toThrow("not found");
    expect(session.endSession).toHaveBeenCalled();
  });
});
