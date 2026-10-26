const { getChannel } = require("../config/rabbitmq");
const { EMAIL_QUEUE } = require("../rabbitmq/queues");
const { notify } = require("../utils/orderNotifications");
const { getOtpEmailHtml } = require("../utils/generateOTP");

async function deliverEmail(event) {
  if (event.eventName === "password.otp") {
    if (!event.email || !event.otp) throw new Error("OTP email message is incomplete");
    await sendEmail({
      email: event.email,
      subject: "OTP for resetting password",
      html: getOtpEmailHtml(event.otp),
    });
    return;
  }

  await notify(event);
}


async function startEmailConsumer() {
  const channel = getChannel();
  channel.prefetch(5);

  await channel.consume(EMAIL_QUEUE, async (message) => {
    if (!message) return;
    try {
      await deliverEmail(JSON.parse(message.content.toString()));
      channel.ack(message);
    } catch (error) {
      console.error("Failed to send queued email", error);
      channel.nack(message, false, true);
    }
  }, { noAck: false });
}

module.exports = { startEmailConsumer, deliverEmail };
