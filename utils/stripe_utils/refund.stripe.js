const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../ApiError");
const orderServ = require("../../services/order.user.Service");
const productServ = require("../../services/product.service");
const productVarServ = require("../../services/product.variations.services");
const { delCache } = require("../redis.methods");

class stripeRefund {
  static async checkRefundable(paymentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId, {
        expand: ["latest_charge"],
      });
      if (
        paymentIntent.latest_charge?.amount_refunded >=
        paymentIntent.latest_charge?.amount
      ) {
        throw new ApiError(
          "Order is not refundable: already fully refunded",
          400,
        );
      }
      return true;
    } catch (err) {
      if (err instanceof ApiError) throw err; // re-throw your own errors
      throw new ApiError(`Order is not refundable: ${err.message}`, 400); // wrap Stripe errors
    }
  }

  static async refundPayment(paymentId, amount) {
    try {
      const refundable = await this.checkRefundable(paymentId);
      if (refundable) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: amount * 100, // Stripe expects amount in cents
        });
        return refund;
      }
    } catch (err) {
      throw new ApiError(`Failed to refund payment: ${err.message}`, 500);
    }
  }

  static async getRefund(refundId) {
    try {
      const refund = await stripe.refunds.retrieve(refundId);
      return refund;
    } catch (err) {
      throw new ApiError(`Failed to retrieve refund: ${err.message}`, 500);
    }
  }

  static async refundAllPayments() {
    try {
      for await (const payment of stripe.paymentIntents.list({
        limit: 100,
        expand: ["data.latest_charge"],
      })) {
        if (
          payment.latest_charge?.amount_refunded <
            payment.latest_charge?.amount &&
          payment.metadata?.isDelivered == "false"
        ) {
          await this.refundPayment(
            payment.id,
            payment.latest_charge?.amount / 100,
          );
        }
      }
    } catch (error) {
      throw new ApiError(`Failed to refund payment: ${error.message}`, 500);
    }
  }

  static async handleRefundSucceeded(object) {
    try {
      const order = await orderServ.cancelOrder(object.metadata.orderId);
      await productServ.bulkWrite(order.productRefundBulkOptions);
      await productVarServ.bulkWrite(order.variationRefundBulkOptions);
      await Promise.all(
        [...order.productIdsSet].map((id) => delCache(`product_${id}`)),
      );
    } catch (err) {
      throw new ApiError(
        `Failed to handle refund success: ${err.message}`,
        500,
      );
    }
  }

  static async handleRefundFailed(object) {
    // send email to notify user about failed refund
    console.log("Refund failed for refund ID:", object);
  }
}

module.exports = stripeRefund;
