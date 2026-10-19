const ApiError = require("../utils/apiError");
const StripePaymentStrategy = require("./strategies/stripe.payment.strategy");
const CashPaymentStrategy = require("./strategies/cash.payment.strategy");

const strategies = {
  stripe: new StripePaymentStrategy(),
  cash: new CashPaymentStrategy(),
};

class PaymentStrategyFactory {
  static register(provider, strategy) {
    if (!strategy || typeof strategy.initiate !== "function") {
      throw new TypeError("Payment strategies must implement initiate().");
    }
    strategies[String(provider).toLowerCase()] = strategy;
  }

  static create(provider) {
    const strategy = strategies[String(provider || "").toLowerCase()];
    if (!strategy) {
      throw new ApiError(`Unsupported payment provider: ${provider}`, 400);
    }
    return strategy;
  }
}

module.exports = PaymentStrategyFactory;
