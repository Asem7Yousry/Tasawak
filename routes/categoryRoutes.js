const express = require("express");
const router = express.Router();
const Catserv = require("../controllers/categoryService");

router.route("/").get(Catserv.getAllCategory).post(Catserv.createCategory);
router
  .route("/:categoryID")
  .get(Catserv.getSpecificCategory)
  .put(Catserv.updateSpecificCategory)
  .delete(Catserv.deleteSpecificCategory);

module.exports = router;
