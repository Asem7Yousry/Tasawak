const ApiError = require("../utils/ApiError");

exports.chainWords = (str) => {
  return str.trim().replace(/\s+/g, "-").toLowerCase();
};

exports.checkDuplicate = async (Model, criteria, errorMessage) => {
  /// its a promise that resolves to the found document or null if not found
  const duplicate = await Model.findOne(criteria);
  if (duplicate) {
    throw new ApiError(errorMessage, 409);
  }
};
