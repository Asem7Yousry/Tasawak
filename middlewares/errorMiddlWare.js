const errorHandellingMiddleWare = (error, request, response, next) => {
  if (process.env.NODE_ENV === "development") {
    return erroHandelDev(error, response);
  } else {
    response.status(error.statusCode || 500).json({
    success: false,
    status: error.status,
    message: error.message,
  });
  }
};

const erroHandelDev = (error, response) => {
  response.status(error.statusCode || 500).json({
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

module.exports = errorHandellingMiddleWare;
