const router = require("express").Router();
const {
  createProduct,
  findAllProduct,
  updateProductStatus,
  findAllProductMaster,
  findCountAllProduct,
} = require("../../controllers/controllers-seller/product-controller");

router.post("/", createProduct);
router.get("/", findAllProduct);
router.get("/count-product", findCountAllProduct);
router.get("/product-master", findAllProductMaster);
router.put("/:id", updateProductStatus);

module.exports = router;

//
