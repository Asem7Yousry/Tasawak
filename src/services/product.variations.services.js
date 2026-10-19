const { productVariation } = require("../models/productModel");
const commonService = require("./common.service");

class productVariationServices extends commonService {
  create(req) {
    let data = req.body;
    data["productId"] = req.params.productID;
    return this.model.create(data);
  }

  bulkWrite(operations) {
    this.model.bulkWrite(operations);
  }
}

module.exports = new productVariationServices(productVariation);
