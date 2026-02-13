const JWT = require("jsonwebtoken");
const ApiError = require("./apiError");

/// verify user authentication methods ///
exports.verifyAuthentication = (req, res, next) => {
  try {
    const bearerToken = req.headers["authorization"];
    if (!bearerToken) {
      throw new ApiError("not autherized, please login to continue", 401);
    }
    const token = bearerToken.split("Bearer ")[1];
    req.user = JWT.verify(token, process.env.SECRET_KEY);
    next();
  } catch (err) {
    next(new ApiError(err.message, 401))
  }
};

exports.verifyRefreshToken = (req) => {
  let user = JWT.verify(req.cookies.refreshToken, process.env.SECRET_KEY);
  req.user = user;
};

/// user permision methods ///
exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin" && req.user.panned === false) {
    return next();
  }
  next(new ApiError("you are not permitted to perform that action", 403));
};

exports.isAthenticated = (req, res, next) => {
  if (req.params.userID === req.user._id && req.user.panned === false) {
    return next();
  }
  next(new ApiError("you are not permitted to perform that action", 403));
};
