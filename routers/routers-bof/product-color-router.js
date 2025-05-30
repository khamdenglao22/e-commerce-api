const router = require("express").Router();
const {
  findAllProductColor,
  findProductColorById,
  createProductColor,
  updateProductColor,
} = require("../../controllers/controllers-bof/product-color-controller");

router.get("/", findAllProductColor);
router.get("/:id", findProductColorById);
router.post("/", createProductColor);
router.put("/:id", updateProductColor);

module.exports = router;
