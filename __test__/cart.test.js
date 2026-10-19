const {
  test,
  describe,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const mongoose = require("mongoose");
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
const cartServ = require("../src/services/cart.service");
const dotenv = require("dotenv");
dotenv.config();

describe.skip("test cart operations", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test.skip("test getting new cart", async () => {
    const user_id = "507f1f77bcf86cd799439012";
    const cart = await cartServ.getCart(user_id);
    console.log("final cart:", cart);
    expect(cart).toHaveProperty("items");
  });

  test.skip("test adding product variation to cart", async () => {
    const product = {
      _id: "69d7f89717bd1555dba6c71c",
      name: "bombom shark",
      description: "energy drink with zero sugar ",
      categoryID: "69d7f6e717bd1555dba6c710",
      subCategories: ["69d7f86617bd1555dba6c717"],
      brandID: "69d7f85617bd1555dba6c714",
      basePrice: 25,
      rateCount: 0,
      sold: 475,
      soldOut: false,
      imageCover:
        "https://tse2.mm.bing.net/th/id/OIP.ADUf_mdbWnbMMd2KYVfmXgHaHa?r=0&cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3",
      variations: [
        {
          _id: "6a3583ae12e0ea6ec609e5ef",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 15,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583bc12e0ea6ec609e5f1",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 15,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583c812e0ea6ec609e5f3",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 10,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583d912e0ea6ec609e5f5",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 15,
          image: "https://example.com/black-l.jpg",
        },
      ],
      quantity: 400000,
    };
    const variationId = "6a3583bc12e0ea6ec609e5f1";
    // const variationId = "6a3583c812e0ea6ec609e5f3";
    const userId = "507f1f77bcf86cd799439012";
    const returnedCart = await cartServ.addCartItem(
      userId,
      variationId,
      product,
      5,
    );
    console.log("returned cart:-", returnedCart);
  });

  test.skip("test deleting cart from db", async () => {
    const userId = "507f1f77bcf86cd799439012";
    await cartServ.deleteCart(userId);
  });

  test.skip("test removing product variation from cart", async () => {
    const userId = "507f1f77bcf86cd799439012";
    const variationId = "6a3583bc12e0ea6ec609e5f1";
    // const variationId = "6a3583c812e0ea6ec609e5f3";
    const returnedCart = await cartServ.removeCartItem(userId, variationId);
    console.log("returnedCart", returnedCart);
  });

  test.skip("test change in quantity", async () => {
    const product = {
      _id: "69d7f89717bd1555dba6c71c",
      name: "bombom shark",
      description: "energy drink with zero sugar ",
      categoryID: "69d7f6e717bd1555dba6c710",
      subCategories: ["69d7f86617bd1555dba6c717"],
      brandID: "69d7f85617bd1555dba6c714",
      basePrice: 25,
      rateCount: 0,
      sold: 475,
      soldOut: false,
      imageCover:
        "https://tse2.mm.bing.net/th/id/OIP.ADUf_mdbWnbMMd2KYVfmXgHaHa?r=0&cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3",
      variations: [
        {
          _id: "6a3583ae12e0ea6ec609e5ef",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 20,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583bc12e0ea6ec609e5f1",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 15,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583c812e0ea6ec609e5f3",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 10,
          image: "https://example.com/black-l.jpg",
        },
        {
          _id: "6a3583d912e0ea6ec609e5f5",
          attribute: {
            taste: "zero sugar",
          },
          quantity: 100000,
          piecePrice: 15,
          image: "https://example.com/black-l.jpg",
        },
      ],
      quantity: 400000,
    };
    const userId = "507f1f77bcf86cd799439012";
    // const variationId = "6a3583bc12e0ea6ec609e5f1";
    // const variationId = "6a3583c812e0ea6ec609e5f3";
    const variationId = "6a3583ae12e0ea6ec609e5ef";
    const returnedCart = await cartServ.changeCartItemQuantity(
      userId,
      variationId,
      product,
      5,
    );
    console.log("returnedCart", returnedCart);
  });
});
