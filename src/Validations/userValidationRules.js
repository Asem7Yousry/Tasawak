const userFields = require("./userFieldsValidation");
const validatorMiddleWare = require("../middlewares/ValidatorMiddleWareMethod");

exports.signUpValidator = [
  userFields.emailValidation,
  userFields.phoneNumberValidation,
  userFields.passwordValidation,
  userFields.passwordConfirmationValidation,
  validatorMiddleWare,
];

exports.logInValidator = [
  userFields.emailValidation,
  userFields.passwordValidation,
  validatorMiddleWare,
]

exports.getUserByID = [
  userFields.idValidation,
  validatorMiddleWare,
];

exports.changePasswordValidator = [
  userFields.idValidation,
  userFields.passwordValidation,
  userFields.passwordConfirmationValidation,
  validatorMiddleWare,
]

exports.generateToken = [
  userFields.refreshTokenValidation,
  validatorMiddleWare,
];
