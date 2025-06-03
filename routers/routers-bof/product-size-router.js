const router = require("express").Router();
const {
  findAllProductSizes,
  findProductSizeById,
  createProductSize,
  updateProductSize,
  findAllProductSizesByCategory,
} = require("../../controllers/controllers-bof/product-size-controller");

router.get("/", findAllProductSizes);
router.get("/:id", findProductSizeById);
router.get(
  "/product-size-by-category/:category_id",
  findAllProductSizesByCategory
);
router.post("/", createProductSize);
router.put("/:id", updateProductSize);

module.exports = router;
