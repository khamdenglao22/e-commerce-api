const router = require("express").Router();
const {
  findAllProductOptionsByProductId,
} = require("../../controllers/controllers-cus/product-option-cus-controller");

router.get("/:product_id/:option_type", findAllProductOptionsByProductId);

module.exports = router;
