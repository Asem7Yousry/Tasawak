const JWT = require("jsonwebtoken");

exports.jwtCreator = (user) => {
  let { _id, fullName, email, phoneNumber, role, panned } = user;
  let payload = {
    _id,
    fullName,
    email,
    phoneNumber,
    role,
    panned,
  };
  let accessToken = JWT.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  let refreshToken = JWT.sign({ userId: _id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
  return {accessToken, refreshToken};
};
