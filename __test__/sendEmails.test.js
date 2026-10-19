jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));

let nodemailer;

describe("SMTP email sender", () => {
  let sendEmail;
  let sendMail;
  let verify;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    nodemailer = require("nodemailer");
    process.env.Gmail_Host = "smtp.example.test";
    process.env.Gmail_Port = "587";
    process.env.Gmail_Secure = "false";
    process.env.Gmail_User = "mailer@example.test";
    process.env.Gmail_Password = "test-password";
    delete process.env.Email;
    sendMail = jest.fn().mockResolvedValue({ accepted: ["buyer@example.test"], rejected: [], messageId: "test-id" });
    verify = jest.fn().mockResolvedValue(true);
    nodemailer.createTransport.mockReturnValue({ sendMail, verify });
    sendEmail = require("../src/utils/sendEmails");
  });

  afterEach(() => {
    delete process.env.Gmail_Host;
    delete process.env.Gmail_Port;
    delete process.env.Gmail_Secure;
    delete process.env.Gmail_User;
    delete process.env.Gmail_Password;
    delete process.env.Email;
  });

  test("uses parsed SMTP settings and returns the delivery result", async () => {
    await expect(sendEmail({ email: "buyer@example.test", subject: "Test", html: "<p>Hello</p>" }))
      .resolves.toMatchObject({ messageId: "test-id" });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: "smtp.example.test",
      port: 587,
      secure: false,
      auth: { user: "mailer@example.test", pass: "test-password" },
    }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: "Tasawak <mailer@example.test>",
      to: "buyer@example.test",
      subject: "Test",
      html: "<p>Hello</p>",
    }));
  });

  test("fails clearly when SMTP settings are missing", async () => {
    delete process.env.Gmail_Password;
    await expect(sendEmail({ email: "buyer@example.test", subject: "Test", text: "Hello" }))
      .rejects.toThrow("Email is not configured. Missing: Gmail_Password");
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  test("exposes SMTP verification for a connection check", async () => {
    await expect(sendEmail.verifyConnection()).resolves.toBe(true);
    expect(verify).toHaveBeenCalledTimes(1);
  });
});
