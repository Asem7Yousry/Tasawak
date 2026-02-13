const nodemailer = require("nodemailer");

// method to send emails
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.Gmail_Host,
    port: Number(process.env.Gmail_Port),
    secure: Boolean(process.env.Gmail_Secure),
    auth: {
      user: process.env.Gmail_User,
      pass: process.env.Gmail_Password,
    },
  });
  // mail options
  const mailOptions = {
    from: `GO Company <${process.env.Email}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
