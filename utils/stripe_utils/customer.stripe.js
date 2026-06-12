const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userServ = require("../../services/user.service");
const ApiError = require("../ApiError");
const stripePaymentMethod = require("./paymentMethod.stripe");

class stripeCustomer {
  static async createCustomer(req) {
    try {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.fullName.first_name} ${req.user.fullName.last_name}`,
        phone: req.user.phoneNumber || "",
        metadata: { userId: req.user._id.toString() },
      });
      await userServ.setUserSubscriptionData(req.user._id, {
        stripeCustomerId: customer.id,
      });
      return customer;
    } catch (err) {
      throw new ApiError(
        `Failed to create Stripe customer: ${err.message}`,
        500,
      );
    }
  }

  static async retrieveCustomer(stripeCustomerId, params = {}) {
    try {
      const customer = await stripe.customers.retrieve(
        stripeCustomerId,
        params,
      );
      if (!customer) {
        throw new ApiError("Stripe customer not found", 404);
      }
      return customer;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe customer: ${err.message}`,
        500,
      );
    }
  }

  static async updateCustomer(stripeCustomerId, updateData) {
    try {
      const customer = await stripe.customers.update(
        stripeCustomerId,
        updateData,
      );
      return customer;
    } catch (err) {
      throw new ApiError(
        `Failed to update Stripe customer: ${err.message}`,
        500,
      );
    }
  }

  // add new payment method to user subscription data
  static async addPaymentMethodToCustomer(req) {
    // get or create Stripe customer for the user
    if (!req.user?.subscription?.stripeCustomerId) {
      customerId = (await this.createCustomer(req)).id;
    }
    let customerId = req.user.subscription.stripeCustomerId;
    // create new payment method in Stripe
    const paymentMethod = await stripePaymentMethod.createPaymentMethod(
      req.body.type,
      req.body.cardDetails,
      customerId,
    );
    // Update the user's subscription with the new payment method
    if (req.body?.makeDefault) {
      const updatedCustomer = await this.updateCustomer(customerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });
    }
    return paymentMethod;
  }

  // list all payment methods of a customer
  static async listCustomerPaymentMethods(stripeCustomerId) {
    const customer = await this.retrieveCustomer(stripeCustomerId);
    const paymentMethods =
      await stripe.customers.listPaymentMethods(stripeCustomerId);
    return {
      paymentMethods,
      defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
    };
  }

  // delete payment method from customer
  static async detachPaymentMethod(paymentMethodId, customerId) {
    try {
      // ── Step 1: Fetch customer default payment method ─────────
      const customer = await this.retrieveCustomer(customerId);
      const defaultPmId = customer.invoice_settings?.default_payment_method;
      const wasDefault = defaultPmId === paymentMethodId;
      // ── Step 2: Detach the payment method + remaining PMs in parallel ───
      await stripePaymentMethod.detachPaymentMethod(paymentMethodId);
      // ── Step 3: If detached PM was the default, assign a new one ───
      if (wasDefault) {
        const remainingPaymentMethods =
          await this.listCustomerPaymentMethods(customerId);
        const hasRemaining = remainingPaymentMethods.data.length > 0;
        if (hasRemaining) {
          // Pick the first remaining PM as the new default
          const newDefault = remainingPaymentMethods.data[0];
          await this.updateCustomer(customerId, {
            invoice_settings: {
              default_payment_method: newDefault.id,
            },
          });
        } else {
          // No PMs left — clear the default
          await this.updateCustomer(customerId, {
            invoice_settings: {
              default_payment_method: null,
            },
          });
        }
      }
    } catch (err) {
      throw new ApiError(
        `Failed to detach Stripe payment method: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripeCustomer;
