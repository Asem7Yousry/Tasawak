const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const { jwtCreator } = require("../utils/jwtMethod");
const userService = require("../services/user.service");
const { getOtpEmailHtml } = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmails");
const { verifyRefreshToken } = require("../utils/AuthMethods");

// @doc signUp endpoint
// @route post /api/users/signup
// @access public
exports.signUp = asyncHandler(async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    let { accessToken, refreshToken } = await jwtCreator(newUser);
    res
      .status(201)
      .json({
        success: true,
        message: "signed up successfully!",
        data: { accessToken, refreshToken },
      })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate title mongo error
      return next(
        new ApiError(`email: ${req.body["email"]} is already exists`, 400),
      );
    }
    return next(new ApiError(error.message, error.statusCode));
  }
});

// @doc logIn endpoint
// @route post /api/users/logIn
// @access public
exports.logIn = asyncHandler(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email }).select(
    "_id fullName password email phoneNumber role panned address subscription",
  );
  if (!user) {
    return next(new ApiError(`email ${req.body["email"]} not exists`));
  }
  let isCorrectPassword = await bcrypt.compare(
    req.body["password"],
    user.password,
  );
  if (!isCorrectPassword) {
    return next(new ApiError(`wrong password`));
  }
  let { accessToken, refreshToken } = await jwtCreator(user);
  res
    .status(200)
    .json({
      success: true,
      message: "loged in successfully!",
      data: { accessToken, refreshToken },
    })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
});

// @doc regenerate new access and refresh tokens (by only refresh token)
// @route put /api/User/generate-token/
// @access private
exports.generateToken = asyncHandler(async (req, res, next) => {
  verifyRefreshToken(req);
  let user = await User.findById(req.user.userId);
  if (!user) {
    return next(new ApiError("no user exists with id", 404));
  }
  let { accessToken, refreshToken } = await jwtCreator(user);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  res.status(200).json({
    success: true,
    message: "generate new tokens successfully",
    data: { accessToken },
  });
});

// @doc update specific User by ID
// @route put /api/User/:userID
// @access private
exports.updateSpecificUser = asyncHandler(async (req, res, next) => {
  // exclude for password parameter from request body
  let { password, ...updateBody } = req.body || {};
  let specificUser = await User.findByIdAndUpdate(
    req.params.userID,
    updateBody,
    {
      new: true,
    },
  );
  if (!specificUser) {
    return next(new ApiError(`User ID ${req.params.userID} not exists`, 404));
  }
  res.status(202).json({ success: true, User: specificUser });
});

// @doc update specific User by ID (set password)
// @route put /api/User/setpassword/:userID
// @access private
exports.setPassWord = asyncHandler(async (req, res, next) => {
  // check what type of password setting
  let bodyData;
  if (req.body.oldPassword) {
    let { oldPassword, passwordConfirmation, password, ...restData } = req.body;
    bodyData = { oldPassword, passwordConfirmation, password };
  } else {
    let { password, ...updateBody } = req.body;
    bodyData = { password };
  }
  // exclude for password parameter from request body
  let specificUser = await User.findByIdAndUpdate(req.params.userID, bodyData, {
    new: true,
  });
  if (!specificUser) {
    return next(new ApiError(`User ID ${req.params.userID} not exists`, 404));
  }
  res.status(202).json({ success: true, User: specificUser });
});

// @doc forget password by sending email
// @route put /api/User/forgetPassword/
// @access public
exports.forgotPassWord = async (req, res, next) => {
  try {
    const { OTP, user } = await userService.forgetPassWordService(
      req.body.email,
    );
    // send OTP via email
    try {
      await sendEmail({
        email: user.email,
        subject: "OTP for resetting password",
        html: getOtpEmailHtml(OTP),
      });
    } catch (err) {
      await user.updateOne({
        $unset: {
          passWordOTP: 1,
          passwordResetExpires: 1,
        },
      });
      return next(new ApiError("failed to send email", 500));
    }
    res.status(200).json({
      status: "success",
      message: "OTP Sent to your email, check your DM",
      data: {
        userID: user._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @doc verify email by sending the OTP sent to user
// @route put /api/User/verifyOTP/
// @access public
exports.verifyOTP = async (req, res, next) => {
  try {
    const userID = req.headers.userid;
    const OTP = req.body.OTP;
    let user = await userService.verifyUserOTP(userID, OTP);
    res.status(201).json({
      status: "success",
      message: "OTP verified successfully!",
      data: { userID: user._id },
    });
  } catch (err) {
    next(err);
  }
};

// @doc resetting password after verfing
// @route put /api/User/resetPassword/
// @access public
exports.resetPassword = async (req, res, next) => {
  const password = req.body.password;
  const userID = req.headers.userid;
  let user = await userService.resetPasswordService(userID, password);
  user.password = undefined;
  let token = await jwtCreator(user);
  res.status(202).json({
    status: "success",
    message: "password resetted successfully!",
    data: { token },
  });
};
