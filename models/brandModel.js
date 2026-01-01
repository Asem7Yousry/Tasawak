const mongoose = require("mongoose");
const slugify = require("slugify");

const brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title reuired"],
      minlength: [3, "Title mustn't be less than 3 letters"],
      maxlength: [15, "Title must be less than 16 letters"],
      unique:true,
      trim:true 
    },
    slug: {
      type: String,
      lowercase: true,
    },
    imageUrl: String,
  },
  { timestamps: true }
);


// middle ware for saving and updating brand object
brandSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update?.title) {
    update.slug = slugify(update.title);
  }
});

brandSchema.pre("save", function () {
    this.slug = slugify(this.title);
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
