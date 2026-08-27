const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../apiError");

class stripeProduct {
  static async createProduct(name, description) {
    try {
      const product = await stripe.products.create({
        name: name,
        description: description,
      });
      return product;
    } catch (err) {
      throw new ApiError(
        `Failed to create Stripe product: ${err.message}`,
        500,
      );
    }
  }

  static async archiveProduct(stripeProductId) {
    try {
      const archivedProduct = await stripe.products.update(stripeProductId, {
        active: false,
      });
      return archivedProduct;
    } catch (err) {
      throw new ApiError(
        `Failed to archive Stripe product: ${err.message}`,
        500,
      );
    }
  }

  static async updateProduct(stripeProductId, updateData) {
    try {
      const updatedProduct = await stripe.products.update(
        stripeProductId,
        updateData,
      );
      return updatedProduct;
    } catch (err) {
      throw new ApiError(
        `Failed to update Stripe product: ${err.message}`,
        500,
      );
    }
  }

  static async getProduct(stripeProductId) {
    try {
      const product = await stripe.products.retrieve(stripeProductId);
      return product;
    } catch (err) {
      throw new ApiError(
        `Failed to retrieve Stripe product: ${err.message}`,
        500,
      );
    }
  }
}

module.exports = stripeProduct;
