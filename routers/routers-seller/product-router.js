const router = require("express").Router();
const {
  createProduct,
  findAllProduct,
} = require("../../controllers/controllers-seller/product-controller");

router.post("/", createProduct);
router.get("/", findAllProduct);

module.exports = router;

//
