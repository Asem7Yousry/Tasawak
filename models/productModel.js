const mongoose = require("mongoose");
const slugify = require("slugify");
const redis = require("../config/redis.config");

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
    categoryName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
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
    colors: {
      type: [String],
      default: undefined,
    },
    sizes: {
      type: [String],
      default: undefined,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "quantity must be above or equal 1"],
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
    images: [String],
    imageCover: String,
  },
  { timestamps: true },
);

// create text index on name , description
productSchema.index({
  name: "text",
  description: "text",
  categoryName: "text",
});

productSchema.pre("save", function () {
  this.slug = slugify(this.name);
});

productSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  // update slug if name changed
  if (update?.name) {
    update.slug = slugify(update.name);
  }
});

productSchema.post("findOneAndUpdate", async function (doc) {
  const update = this.getUpdate();
  // handle price change → update Redis
  if (update?.$set.price || update?.$set.quantity) {
    // delete cached product
    await redis.del(`product_${doc._id}`);
    // enhance the needed data from product to be cached
    let { _id, name, quantity, price } = doc;
    await redis.set(
      `product_${doc._id}`,
      JSON.stringify({ _id, name, quantity, price }),
      'EX',
      Number(process.env.Redis_Expriation_Time),
    );
  }
});

const Product = mongoose.model("Products", productSchema);

module.exports = Product;
