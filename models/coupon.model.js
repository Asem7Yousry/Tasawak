const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["fixed", "percentage", "freeshipping"],
      default: "percentage",
    },
    maxUsageLimit: Number,
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minOrderValue: Number,
  },
  { timestamps: true },
);

// couponSchema.pre("findOneAndUpdate", async function (doc) {
//   const update = this.getUpdate();
//   if (update?.usedCount && update.usedCount === doc.maxUsageLimit) {
//     update.isActive = false;
//   }
// });

module.exports = mongoose.model("Coupon", couponSchema);
