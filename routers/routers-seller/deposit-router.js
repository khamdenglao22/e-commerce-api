const router = require("express").Router();
const {
  createDeposit,
  findAllDeposit,
  findDepositById,
  // findAllProductMaster,
} = require("../../controllers/controllers-seller/deposit-seller-controller");

router.post("/", createDeposit);
router.get("/", findAllDeposit);
router.get("/:id", findDepositById);
// router.get("/product-master", findAllProductMaster);

module.exports = router;

//
