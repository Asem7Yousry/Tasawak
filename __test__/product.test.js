const {
  test,
  describe,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const mongoose = require("mongoose");
jest.mock("../src/utils/redis.methods", () => ({
  getCache: jest.fn(),
  cacheRedis: jest.fn(),
  delCache: jest.fn(),
}));
const productServ = require("../src/services/product.service");
const productVarServ = require("../src/services/product.variations.services");
const dotenv = require("dotenv");
dotenv.config();

describe.skip("test all Product's Services", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("getById should return product with variations", async () => {
    // const mockProduct = [{
    //   _id: "6a120f8ca5fa9ca603c8e350",
    //   name: "7up lemon",
    //   description: "lemon cold 7up",
    //   categoryID: "69d7f6e717bd1555dba6c710",
    //   subCategories: ["6a120f44a5fa9ca603c8e335"],
    //   brandID: "6a120f65a5fa9ca603c8e343",
    //   basePrice: 10,
    //   rateCount: 0,
    //   sold: 8,
    //   imageCover:
    //     "https://thf.bing.com/th/id/OIP.fC0lMurfFJcm7wi0ts6s3gHaIB?w=143&h=180&c=7&r=0&o=7&cb=thfc1falcon&pid=1.7&rm=3",
    //   soldOut: false,
    //   variations: [
    //     {
    //       _id: "6a3582f612e0ea6ec609e5e9",
    //       attribute: [Object],
    //       quantity: 100000,
    //       piecePrice: 10,
    //       image: "https://example.com/black-l.jpg",
    //     },
    //     {
    //       _id: "6a35831c12e0ea6ec609e5eb",
    //       attribute: [Object],
    //       quantity: 100000,
    //       piecePrice: 10,
    //       image: "https://example.com/black-l.jpg",
    //     },
    //   ],
    //   quantity: 200000,
    // }];
    // jest.spyOn(productServ.model, "aggregate").mockResolvedValue(mockProduct);
    const productId = "69d7f89717bd1555dba6c71c";
    const product = await productServ.getById(productId);
    console.log("product:", product);
    expect(product).toBeDefined();
    expect(product.variations).toBeDefined();
  });

  test.skip("test list all products", async () => {
    const products = await productServ.list({ query: {} });
    console.log("products:", products);
    expect(products).toBeDefined();
  });

  test.skip("test create product", async () => {
    const newProduct = {
      name: "Test Product",
      description: "This is a test product",
      categoryID: "69d7f6e717bd1555dba6c710",
      subCategories: ["6a120f44a5fa9ca603c8e335"],
      brandID: "6a120f65a5fa9ca603c8e343",
      basePrice: 10,
      imageCover: "https://example.com/test-product.jpg",
      soldOut: false,
    };
    const createdProduct = await productServ.create({ body: newProduct });
    console.log("createdProduct:", createdProduct);
    expect(createdProduct).toBeDefined();
  });

  test.skip("test delete product by ID", async () => {
    const productId = "6aa9427d63118364c0e72f62"; // Replace with a valid product ID
    const deletedProduct = await productServ.deleteById(productId);
    console.log("deletedProduct:", deletedProduct);
    expect(deletedProduct).toBeDefined();
  });
});

describe.skip("test all Product's Services", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test.skip("update varaition price", async () => {
    const productId = "6a3582f612e0ea6ec609e5e9";
    const data = { piecePrice: 9999, quantity: 568 };
    const updatedata = await productVarServ.updateById(productId, data);
    console.log(updatedata);
    expect(updatedata).toBeDefined();
  });

  test("getById should return product with variations", async () => {
    const productId = "6a3583ae12e0ea6ec609e5ef";
    const product = await productVarServ.getById(productId);
    console.log("product:", product);
    expect(product).toBeDefined();
  });

  test.skip("test list all products", async () => {
    const products = await productVarServ.list({ query: {} });
    console.log("products variations:", products);
    expect(products).toBeDefined();
  });

  test.skip("test create product", async () => {
    const req = {
      body: {
        attribute: { taste: "zero sugaryyy" },
        quantity: 10044400,
        piecePrice: 10.5,
        image: "https://example.com/black-l.jpg",
      },
      params: { productID: "6a3582f612e0ea6ec609e5e9" },
    };
    const createdProduct = await productVarServ.create(req);
    console.log("createdProduct:", createdProduct);
    expect(createdProduct).toBeDefined();
  });

  test.skip("test delete product by ID", async () => {
    const productId = "6aa948e51dc6bd0dfe809bc3"; // Replace with a valid product ID
    const deletedProduct = await productVarServ.deleteById(productId);
    console.log("deletedProduct:", deletedProduct);
    expect(deletedProduct).toBeDefined();
  });
});
