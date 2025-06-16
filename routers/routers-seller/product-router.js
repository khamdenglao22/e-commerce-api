const router = require("express").Router();
const {
  createProduct,
  findAllProduct,
  updateProductStatus,
  findAllProductMaster,
} = require("../../controllers/controllers-seller/product-controller");

router.post("/", createProduct);
router.get("/", findAllProduct);
router.get("/product-master", findAllProductMaster);
router.put("/:id", updateProductStatus);

module.exports = router;

//
