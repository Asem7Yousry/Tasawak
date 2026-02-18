const { validationResult } = require("express-validator");

// validator method that catch invalid request before go to controlers
const validatorMiddleWare = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0]["msg"] });
  }
  next();
};

module.exports = validatorMiddleWare;


// const { validationResult } = require("express-validator");

// const validatorMiddleWare = (req, res, next) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     const err = errors.array()[0];

//     const statusCode =
//       err.msg?.statusCode || 400;

//     const message =
//       err.msg?.message || err.msg;

//     return res.status(statusCode).json({
//       success: false,
//       message,
//     });
//   }

//   next();
// };

// module.exports = validatorMiddleWare;
