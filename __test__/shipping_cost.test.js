const { test, expect, describe } = require("@jest/globals");
const { mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
jest.mock("../src/utils/stripe_utils/shippingCost.stripe", () => ({
  createShippingRate: jest.fn(),
  archiveShippingRate: jest.fn(),
}));
jest.mock("bullmq", () => ({
  Queue: jest.fn(() => ({
    add: jest.fn(),
    close: jest.fn(),
  })),
  Worker: jest.fn(() => ({
    close: jest.fn(),
  })),
}));
jest.mock("../src/config/redis.config", () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
}));
jest.mock("../src/utils/redis.methods", () => ({
  getCache: jest.fn(),
  cacheRedis: jest.fn(),
  delCache: jest.fn(),
}));
const ShippingCostService = require("../src/services/shipping.cost.services");

describe.skip("testing Shipping Cost Service", () => {
  beforeAll(async () => {
    console.log(`connection url: ${process.env.DB_URI}`);
    await mongoose.connect(process.env.DB_URI);
    console.log("Connecting to MongoDB...");
  });
  afterAll(async () => {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB...");
  });

  test.skip("return shipping cost by using name of city and area", async () => {
    // const mockShippingCost = {
    //   city: "Cairo",
    //   area: "Nasr City",
    //   stripeShippingRateId: "shp_123456789",
    //   cost: 50,
    // };
    // jest
    //   .spyOn(ShippingCostService.model, "findOne")
    //   .mockResolvedValue(mockShippingCost);
    const req = {
      body: {
        address: {
          city: "Giza",
          areaName: "helwan",
        },
      },
    };
    const result = await ShippingCostService.getByAddress(req);
    expect(result).toHaveProperty("shippingId");
    expect(result).toHaveProperty("SHIPPING_COST");
    expect(result).toHaveProperty("address");
  });

  test.skip("test update of cart with shipping cost", async () => {
    const req = {
      body: {
        address: {
          city: "allex",
          areaName: "haramy",
        },
      },
      user: {
        _id: "507f1f77bcf86cd799439012",
      },
    };
    const cart = await ShippingCostService.applyShippingCostToCart(req);
  });
});
