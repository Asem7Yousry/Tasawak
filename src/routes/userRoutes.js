const express = require("express");
const AdminServices = require("../controllers/adminService");
const userServ = require("../controllers/user.contoller");
const userRules = require("../Validations/userValidationRules");
const {
  verifyAuthentication,
  isAdmin,
  isAthenticated,
} = require("../utils/AuthMethods");
const { identityRateLimit, checkLoginEmailLimit } = require("../utils/accountRateLimit");

const router = express.Router();

const adminGuard = [verifyAuthentication, isAdmin];
const validateUserID = [userRules.getUserByID];
const userGuard = [verifyAuthentication, isAthenticated];

/* ================= AUTH ================= */
router.post("/signup", userRules.signUpValidator, identityRateLimit, userServ.signUp);
router.post("/login", userRules.logInValidator, identityRateLimit, checkLoginEmailLimit, userServ.logIn);
router.post("/generate-token", userRules.generateToken, identityRateLimit, userServ.generateToken);
// forget password process //
router.post("/forgetPassword", identityRateLimit, userServ.forgotPassWord);
router.post("/verifyOTP", ...validateUserID, identityRateLimit, userServ.verifyOTP);
router.post("/resetPassword", ...validateUserID, identityRateLimit, userServ.resetPassword);

/* ================= ADMIN ================= */
router.get("/", ...adminGuard, AdminServices.getAllUser);

router
  .route("/:userID")
  .put(...userGuard, ...validateUserID, identityRateLimit, userServ.updateSpecificUser)
  .get(...adminGuard, ...validateUserID, identityRateLimit, AdminServices.getSpecificUser)
  .patch(...adminGuard, ...validateUserID, identityRateLimit, AdminServices.pannSpecificUser)
  .delete(...adminGuard, ...validateUserID, identityRateLimit, AdminServices.deleteSpecificUser);

/* ================= USER ================= */
// set password or change it //
router.put(
  "/:userID/setpassword",
  ...userGuard,
  userRules.changePasswordValidator,
  identityRateLimit,
  userServ.setPassWord,
);

module.exports = router;
