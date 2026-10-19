jest.mock("../src/models/order.Model", () => ({ findById: jest.fn(), findOneAndUpdate: jest.fn(), updateOne: jest.fn() }));
jest.mock("../src/models/userModel", () => ({ findById: jest.fn() }));
jest.mock("../src/utils/sendEmails", () => jest.fn());

const Order = require("../src/models/order.Model");
const User = require("../src/models/userModel");
const sendEmail = require("../src/utils/sendEmails");
const { notify } = require("../src/utils/orderNotifications");

describe("order notification delivery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      email: "asem23yousry@example.test",
      fullName: { first_name: "Somaa", last_name: "El 3ashek" }
    });
    Order.findOneAndUpdate.mockResolvedValue({ _id: "o1" });
    Order.updateOne.mockResolvedValue({});
  });

  test("sends the payment success email and atomically claims the event", async () => {
    Order.findById.mockResolvedValue({
      _id: "o1",
      userId: "u1",
      isPaid: true,
      paymentStatus: "paid",
      items: {}
    });
    await notify({
      eventName: "payment.success",
      orderId: "o1",
      paymentId: "pi1",
      paymentProvider: "stripe"
    });
    expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "o1", notificationEvents: { $ne: "payment.success" } },
      { $addToSet: { notificationEvents: "payment.success" } },
      { new: true },
    );
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "asem23yousry@example.test",
      subject: "Payment confirmed for order #o1"
    }));
  });

  test("does not send duplicate notifications", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", userId: "u1", isPaid: true, paymentStatus: "paid" });
    Order.findOneAndUpdate.mockResolvedValue(null);
    await notify({ eventName: "payment.success", orderId: "o1" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  test("releases the notification claim when email delivery fails", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", userId: "u1", isPaid: false, paymentStatus: "failed" });
    sendEmail.mockRejectedValue(new Error("smtp unavailable"));
    await expect(notify({ eventName: "payment.failure", orderId: "o1" })).rejects.toThrow("smtp unavailable");
    expect(Order.updateOne).toHaveBeenCalledWith({ _id: "o1" }, { $pull: { notificationEvents: "payment.failure" } });
  });

  test("suppresses stale failure notifications after a successful payment", async () => {
    Order.findById.mockResolvedValue({ _id: "o1", userId: "u1", isPaid: true, paymentStatus: "paid" });
    await notify({ eventName: "payment.failure", orderId: "o1" });
    expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
