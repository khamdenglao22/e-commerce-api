const router = require("express").Router();
const {
  createWithdraw,
  findAllWithdraw,
  findWithdrawById,
} = require("../../controllers/controllers-seller/withdraw-seller-controller");

router.post("/", createWithdraw);
router.get("/", findAllWithdraw);
router.get("/:id", findWithdrawById);

module.exports = router;

//
