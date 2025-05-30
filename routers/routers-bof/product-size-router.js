const router = require("express").Router();
const {
  findAllProductSizes,
  findProductSizeById,
  createProductSize,
  updateProductSize,
} = require("../../controllers/controllers-bof/product-size-controller");

router.get("/", findAllProductSizes);
router.get("/:id", findProductSizeById);
router.post("/", createProductSize);
router.put("/:id", updateProductSize);

module.exports = router;
