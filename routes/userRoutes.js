const express = require("express");
const AdminServices = require("../controllers/adminService");
const userServ = require("../controllers/user.contoller");
const userRules = require("../Validations/userValidationRules");
const {
  verifyAuthentication,
  isAdmin,
  isAthenticated,
} = require("../utils/AuthMethods");

const router = express.Router();

const adminGuard = [verifyAuthentication, isAdmin];
const validateUserID = [userRules.getUserByID];
const userGuard = [verifyAuthentication, isAthenticated];

/* ================= AUTH ================= */
router.post("/signup", userRules.signUpValidator, userServ.signUp);
router.post("/login", userRules.logInValidator, userServ.logIn);
router.post("/generate-token", userRules.generateToken, userServ.generateToken);
// forget password process //
router.post("/forgetPassword", userServ.forgotPassWord);
router.post("/verifyOTP", ...validateUserID, userServ.verifyOTP);
router.post("/resetPassword", ...validateUserID, userServ.resetPassword);

/* ================= ADMIN ================= */
router.get("/", ...adminGuard, AdminServices.getAllUser);

router
  .route("/:userID")
  .put(...userGuard, ...validateUserID, userServ.updateSpecificUser)
  .get(...adminGuard, ...validateUserID, AdminServices.getSpecificUser)
  .patch(...adminGuard, ...validateUserID, AdminServices.pannSpecificUser)
  .delete(...adminGuard, ...validateUserID, AdminServices.deleteSpecificUser);

/* ================= USER ================= */
// set password or change it //
router.put(
  "/:userID/setpassword",
  ...userGuard,
  userRules.changePasswordValidator,
  userServ.setPassWord,
);

module.exports = router;
