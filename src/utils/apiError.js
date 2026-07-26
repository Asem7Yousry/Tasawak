// @desc class for operational Error 
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith(4) ? "failed" : "error";
    this.isOperational = true;
  }
}

module.exports = ApiError;
