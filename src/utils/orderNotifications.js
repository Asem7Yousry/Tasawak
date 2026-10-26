const fs = require("fs");
const path = require("path");
const orderService = require("../services/order.user.Service");
const userService = require("../services/user.service");
const sendEmail = require("./sendEmails");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const render = (template, values) => {
  let html = fs.readFileSync(path.join(__dirname, "../Views", template), "utf8");
  for (const [key, value] of Object.entries(values)) html = html.replaceAll(`{{${key}}}`, value);
  return html.replace(/{{\w+}}/g, "");
};

async function notify(event) {
  const order = await orderService.getById(event.orderId);
  if (!order) throw new Error(`Order ${event.orderId || ""} not found for notification`);
  const eventKey = event.eventName;
  const user = await userService.findUserById(order.userId);
  const userEmail = user.email;
  if (!userEmail) throw new Error(`No email available for order ${order._id}`);
  const customerName = [user?.fullName?.first_name, user?.fullName?.last_name].filter(Boolean).join(" ") || "customer";
  const currency = (order.currency || "egp").toUpperCase();
  const total = Number(order.totalAfterDiscount || order.totalPrice).toFixed(2);
  const items = Object.values(order.items || {}).map((item) => `<tr><td>${escapeHtml(item.productName || "Item")}</td><td>${escapeHtml(item.quantity)}</td><td>${currency} ${Number(item.price || item.piecePrice || 0).toFixed(2)}</td></tr>`).join("");
  const common = {
    customerName: escapeHtml(customerName),
    orderId: escapeHtml(order._id), currency, total,
    provider: escapeHtml(event.paymentProvider || order.paymentMethod),
    reference: escapeHtml(event.paymentId || order.paymentId || "Not provided"),
    paymentMethod: escapeHtml(order.paymentMethod),
    paymentStatus: escapeHtml(order.paymentStatus || (order.isPaid ? "paid" : "unpaid")),
    items: `<table role="presentation" width="100%">${items}</table>`
  };
  const messages = {
    "order.created": ["order-created.html", `Order #${order._id} confirmed`],
    "payment.success": ["payment-success.html", `Payment confirmed for order #${order._id}`],
    "payment.failure": ["payment-failed.html", `Payment unsuccessful for order #${order._id}`],
    "payment.succeeded": ["payment-success.html", `Payment confirmed for order #${order._id}`],
    "payment.failed": ["payment-failed.html", `Payment unsuccessful for order #${order._id}`],
    "order.canceled": ["order-canceled.html", `Order #${order._id} canceled`],
  };
  const config = messages[eventKey];
  if (!config) return;
  try {
    await sendEmail({ email: userEmail, subject: config[1], html: render(config[0], common) });
  } catch (error) {
    throw error;
  }
}

module.exports = { notify };
