const { check } = require("express-validator");
const ApiError = require("../apiError");

// validation of each User's field//

exports.refreshTokenValidation = check("refreshToken")
  .notEmpty()
  .withMessage("refreshToken is required");

exports.idValidation = check("userID")
  .notEmpty()
  .withMessage("user ID is required")
  .isMongoId()
  .withMessage("not Valid Mongo Id for User");

exports.phoneNumberValidation = check("phoneNumber")
  .trim()
  .notEmpty()
  .withMessage("phone number required")
  .isMobilePhone("ar-EG")
  .withMessage("Invalid Egyptian phone number");

exports.emailValidation = check("email")
  .trim()
  .notEmpty()
  .withMessage("Email required")
  .isEmail()
  .withMessage("Invalid email structure");

exports.passwordValidation = check("password")
  .trim()
  .notEmpty()
  .withMessage("paassword is required")
  .isLength({ min: 5 })
  .withMessage("Password must be at least 5 characters long");

exports.passwordConfirmationValidation = check("passwordConfirmation")
  .trim()
  .notEmpty()
  .withMessage("paassword confirmation is required")
  .custom((val, { req }) => {
    let password = req.body.password;
    if (val != password) {
      return Promise.reject(
        new ApiError("password confirmation not equal to password", 400),
      );
    }
    return true;
  });

exports.roleValidation = check("role")
  .optional()
  .isIn(["user", "admin"])
  .withMessage("Role must be either 'user' or 'admin'");

exports.addressValidation = [
  check("address.buildingNumber")
    .optional()
    .isInt()
    .withMessage("Bulding number must be integer")
    .custom((number) => {
      if (number <= 0) {
        return Promise.reject(
          new ApiError("Bulding number must be above zero number"),
        );
      }
      return true;
    }),

  check("address.streetName").optional().trim(),

  check("address.areaName").optional().trim(),

  check("address.state").optional().trim(),

  check("address.fullAddress").optional().trim(),
];

exports.oldPassWordValidation = check("oldPassword")
  .notEmpty()
  .withMessage("old password required")
  .isLength({ min: 5 })
  .withMessage("Password must be at least 5 characters long");
