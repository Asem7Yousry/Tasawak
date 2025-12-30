const { validationResult } = require("express-validator");

// validator method that catch invalid request before go to controlers
const validatorMiddleWare = (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0]["msg"] });
      }
      next()
    }

module.exports = validatorMiddleWare