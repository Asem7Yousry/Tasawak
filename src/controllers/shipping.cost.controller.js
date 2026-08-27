const factory = require("./factoryHandler");
const shippingServices = require("../services/shipping.cost.services");

// @doc create new ShippingCost
// @route Post /api/shipping-cost
// @access private
exports.createShippingCost = factory.createDoc(shippingServices);

// @doc get all ShippingCosts
// @route Get /api/shipping-cost
// @access public
exports.getAllShippingCosts = factory.getAllDoc(
  shippingServices,
  "ShippingCost",
);

// @doc get specific ShippingCost by ID
// @route Get /api/shipping-cost/:shippingCostID
// @access public
exports.getSpecificShippingCost = factory.getSpecificDoc(
  shippingServices,
  "ShippingCost",
  "shippingCostID",
);

// @doc update specific ShippingCost by ID
// @route put /api/shipping-cost/:shippingCostID
// @access private
exports.updateSpecificShippingCost = factory.updateSpecificDoc(
  shippingServices,
  "ShippingCost",
  "shippingCostID",
);

// @doc delete specific ShippingCost by ID
// @route delete /api/shipping-cost/:shippingCostID
// @access private
exports.deleteSpecificShippingCost = factory.deleteSpecificDoc(
  shippingServices,
  "ShippingCost",
  "shippingCostID",
);

// @doc delete specific ShippingCost by ID
// @route delete /api/shipping-cost/:shippingCostID
// @access private
exports.deleteAllShippingCosts = factory.deleteAllDocs(
  shippingServices,
  "ShippingCost",
);
