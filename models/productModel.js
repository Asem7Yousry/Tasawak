const mongoose = require("mongoose");
const slugify = require("slugify");

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
  //   this.category.categoryName = await Category.findOne({_id:this.category.categoryID}).name
});

productSchema.pre("findOneAndUpdate", function () {
  let update = this.getUpdate();
  if (update?.name) {
    update.slug = slugify(update.name);
  }
});

const Product = mongoose.model("Products", productSchema);

module.exports = Product;
