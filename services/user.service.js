const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const { generateOTP, hashCrypto } = require("../utils/generateOTP");

const findUserByEmail = async (email) => {
  let user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(`email:${email} not exists in DataBase`, 404);
  }
  return user;
};

const findUserById = async (id) => {
  let user = await User.findById(id);
  if (!user) {
    throw new ApiError(`user with id:${id} not exists in DataBase`, 404);
  }
  return user;
};

//// forget password services ////
const forgetPassWordService = async (email) => {
  try {
    let user = await findUserByEmail(email);
    // generate OTP and hash it
    const OTP = generateOTP();
    const hashedOTP = hashCrypto(OTP);
    // set OTP with its expiration to user
    user.passWordOTP = hashedOTP;
    user.passwordResetExpires =
      Date.now() + Number(process.env.Expriation_Time);
    user.passwordResetVerified = false;
    await user.save();
    return { OTP, user };
  } catch (err) {
    throw err;
  }
};

// verify user OTP //
const verifyUserOTP = async (userID, OTP) => {
  const user = await User.findOne({
    _id: userID,
    passWordOTP: { $exists: true },
  });
  if (!user) {
    throw new ApiError("no OTP send to email to verify", 403);
  }
  const hashedOTP = hashCrypto(OTP);
  const isExpired = Date.now() > user.passwordResetExpires; // return true if less < 5

  if (user.passWordOTP !== hashedOTP || isExpired) {
    throw new ApiError("Invalid or expired OTP", 400);
  }
  // delete OTP and expiration date from user
  user.passWordOTP = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = true;
  await user.save();
  user.password = undefined;
  return user;
};

const resetPasswordService = async (userID, password) => {
  const user = await User.findOne({
    _id: userID,
    passwordResetVerified: { $exists: true },
  });
  if (user) {
    user.password = password;
    user.passwordResetVerified = undefined;
    await user.save();
    return user;
  } else {
    throw new ApiError("account didn't verified yet", 403);
  }
};

// set user subscription data in database
const setUserSubscriptionData = async (userID, subscriptionData) => {
  const user = await User.findByIdAndUpdate(
    userID,
    { subscription: subscriptionData },
    { new: true },
  );
  return user;
};

module.exports = {
  resetPasswordService,
  verifyUserOTP,
  forgetPassWordService,
  setUserSubscriptionData,
  findUserById
};
