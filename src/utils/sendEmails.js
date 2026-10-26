const nodemailer = require("nodemailer");

let transporter;


function getTransporter() {
  const host = process.env.Gmail_Host;
  const port = Number(process.env.Gmail_Port);
  const user = process.env.Gmail_User;
  const pass = process.env.Gmail_Password;
  const from = process.env.Email || user;
  const missing = [
    ["Gmail_Host", host],
    ["Gmail_Port", Number.isInteger(port) && port > 0 ? port : null],
    ["Gmail_User", user],
    ["Gmail_Password", pass],
    ["Email or Gmail_User", from],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
    });
  }
  return { transporter, from };
}

async function sendEmail(options) {
  if (!options?.email || !options?.subject || (!options.html && !options.text)) {
    throw new Error("Email requires a recipient, subject, and html or text body");
  }

  const { transporter: mailTransport, from } = getTransporter();
  const result = await mailTransport.sendMail({
    from: `Tasawak <${from}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (result.rejected?.includes(options.email) || (result.accepted && result.accepted.length === 0)) {
    throw new Error(`Email server rejected recipient ${options.email}`);
  }
  return result;
}

sendEmail.verifyConnection = async () => {
  const { transporter: mailTransport } = getTransporter();
  return mailTransport.verify();
};

module.exports = sendEmail;
