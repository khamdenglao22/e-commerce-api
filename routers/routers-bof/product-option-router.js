const router = require("express").Router();
const {
  createProductOption,
} = require("../../controllers/controllers-bof/product-option-controller");

router.post("/", createProductOption);

module.exports = router;
