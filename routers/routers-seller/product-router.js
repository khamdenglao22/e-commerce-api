const router = require("express").Router();
const {
  createProduct,
  findAllProduct,
  updateProductStatus,
} = require("../../controllers/controllers-seller/product-controller");

router.post("/", createProduct);
router.get("/", findAllProduct);
router.put("/:id", updateProductStatus);

module.exports = router;

//
