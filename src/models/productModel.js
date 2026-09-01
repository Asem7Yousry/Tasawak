const mongoose = require("mongoose");
const slugify = require("slugify");
const { delCache } = require("../utils/redis.methods");

// variation schema for each product
const productVariationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    attribute: { type: Map, of: String },
    quantity: { type: Number, required: true, min: 0 },
    piecePrice: { type: Number, required: true, min: 5.0 },
    image: String,
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "too short product name"],
    },
    description: {
      type: String,
      required: true,
      minlength: [10, "too short product description"],
    },
    categoryID: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    brandID: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    rateAverage: {
      type: Number,
      min: [1, "product's rate must be above or equal 1"],
      max: [5, "product's rate must be below or equal 5"],
    },
    rateCount: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    slug: String,
    imageCover: String,
    soldOut: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// indexes
productSchema.index({
  name: "text",
  description: "text",
});

// webhocks
const clearProductCache = async (productId) => {
  if (!productId) return;
  await delCache(`product_${productId}`);
};

// ================= PRODUCT =================
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

productSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
  const update = this.getUpdate();
  if (update?.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
    this.setUpdate(update);
  }
});

productSchema.post(
  ["findOneAndUpdate", "updateOne", "findOneAndDelete", "deleteOne"],
  async function (doc) {
    if (!doc) return;
    await clearProductCache(doc._id);
    // if (doc.sold === doc.quantity) {
    //   doc.soldOut = true;
    //   await doc.save();
    // }
  },
);

// ================= VARIATIONS =================
productVariationSchema.post(
  ["findOneAndUpdate", "updateOne", "save", "findOneAndDelete", "deleteOne"],
  async function (doc) {
    if (!doc) return;
    await clearProductCache(doc.productId);
    // const product = await mongoose
    //   .model("Products")
    //   .findByIdAndUpdate(doc.productId, { $inc: { sold: doc.quantity } });
  },
);

// products models
const Product = mongoose.model("Products", productSchema);
const productVariation = mongoose.model(
  "productVariation",
  productVariationSchema,
);

module.exports = { Product, productVariation };
