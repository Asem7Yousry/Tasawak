const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.hashCrypto = (value) => {
  return crypto
    .createHash(process.env.ALGORITHEM)
    .update(value)
    .digest(process.env.DIGEST);
};


exports.getOtpEmailHtml = (otp) => {
  const filePath = path.join(__dirname, "../Views/otp-email.html");
  let html = fs.readFileSync(filePath, "utf8");
  html = html.replace("{{OTP}}", otp);
  return html;
};
