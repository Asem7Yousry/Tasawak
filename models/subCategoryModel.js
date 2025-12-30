const mongoose = require("mongoose");
const slugify = require("slugify");

const subCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      minlength: [3, "title must be at least 3"],
      maxlength: [15, "title must be less than 15 letter"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    categoryID: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName:{
      type:String,
      required:true
    }
  },
  { timestamps: true }
);

subCategorySchema.pre("save", function () {
  this.slug = slugify(this.title);
});

subCategorySchema.pre("findOneAndUpdate", function () {
  let update = this.getUpdate();
  if (update?.title) {
    update.slug = slugify(update.title);
  }
});

const subCategory = mongoose.model("subCategory", subCategorySchema);

module.exports = subCategory;
