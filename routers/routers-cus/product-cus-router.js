const router = require("express").Router();
const {
  findProduct,
  findProductById,
  findAllProductSearch,
} = require("../../controllers/controllers-cus/product-cus-controller");
const {
  getCurrentCustomer,
} = require("../../controllers/controllers-cus/auth-cus-controller");

router.get("/", findProduct);
router.get("/search", findAllProductSearch);
router.get("/:id", findProductById);
module.exports = router;
