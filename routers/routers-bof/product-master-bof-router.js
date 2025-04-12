const router = require("express").Router();
const {
  findAllProduct,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/controllers-bof/product-master-bof-controller");

router.get("/", findAllProduct);
router.get("/:id", findProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
