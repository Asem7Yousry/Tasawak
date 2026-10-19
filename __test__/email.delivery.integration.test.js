// Real SMTP delivery checks. Replace these values with your SMTP account and
// a mailbox you control before running this file. For Gmail, use an App Password.
const SMTP = {
  host: "smtp.gmail.com",
  port: "465",
  user: "asem23yousry@gmail.com",
  password: "lhth budw gjyl uwht",
  from: "asem23yousry@gmail.com",
  recipient: "asem23yousry@gmail.com",
};

process.env.Gmail_Host = SMTP.host;
process.env.Gmail_Port = SMTP.port;
process.env.Gmail_User = SMTP.user;
process.env.Gmail_Password = SMTP.password;
process.env.Email = SMTP.from;

jest.mock("../src/models/order.Model", () => ({
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

const Order = require("../src/models/order.Model");
const { notify } = require("../src/utils/orderNotifications");

describe("real payment notification email delivery", () => {
  beforeAll(() => {
    if (Object.values(SMTP).some((value) => value.startsWith("your-") || value.startsWith("mailbox-"))) {
      throw new Error("Edit the SMTP values at the top of this test file before running it.");
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Order.findOneAndUpdate.mockImplementation(async ({ _id }) => ({ _id }));
    Order.updateOne.mockResolvedValue({});
  });

  test("sends the payment success email", async () => {
    await notify({
      eventName: "payment.success",
      order: {
        _id: `test-success-${Date.now()}`,
        isPaid: true,
        paymentStatus: "paid",
        totalPrice: 100,
        items: {},
      },
      userEmail: SMTP.recipient,
      paymentId: "test-payment-success",
      paymentProvider: "stripe",
    });
  });

  test("sends the payment failure email", async () => {
    await notify({
      eventName: "payment.failure",
      order: {
        _id: `test-failure-${Date.now()}`,
        isPaid: false,
        paymentStatus: "failed",
        totalPrice: 100,
        items: {},
      },
      userEmail: SMTP.recipient,
      paymentId: "test-payment-failure",
      paymentProvider: "stripe",
    });
  });
});
