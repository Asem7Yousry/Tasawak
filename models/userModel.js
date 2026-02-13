const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");

// name schema
const nameSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
  },
  { _id: false },
);

// address schema
const addressSchema = new mongoose.Schema(
  {
    buildingNumber: {
      type: Number,
      min: 1,
    },
    streetName: {
      type: String,
      trim: true,
    },
    areaName: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    fullAddress: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: nameSchema,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    imageURL: String,
    password: {
      type: String,
      minlength: [5, "password must not be less than 5 digits"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    panned: {
      type: Boolean,
      default: false,
      optional: true,
    },
    address: addressSchema,
    // OTP attributes
    passWordOTP: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // password hashing
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 4);
  }
});

userSchema.pre("findOneAndUpdate", async function () {
  let update = this.getUpdate();
  // reset password
  if (update?.oldPassword) {
    // get query of current user
    let currentuser = await this.model
      .findOne(this.getQuery())
      .select("password");
    let isCorrectPassword = await bcrypt.compare(
      update.oldPassword,
      currentuser.password,
    );
    if (isCorrectPassword) {
      // hash new password
      update.password = await bcrypt.hash(update.password, 4);
    } else {
      throw new ApiError("wrong password given", 400);
    }
  }
  // set password
  else if (update?.password) {
    update.password = await bcrypt.hash(update.password, 4);
    // deny email update
  } else if (update?.email) {
    throw new ApiError("email not changable", 403);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
