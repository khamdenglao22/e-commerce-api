const router = require("express").Router();
const {
  findAllDepositBof,
  findDepositByIdBof,
  confirmDepositBof,
  deleteDeposit,
  createDepositOfSeller,
} = require("../../controllers/controllers-bof/deposit-seller-bof-controller");

router.get("/", findAllDepositBof);
router.get("/:id", findDepositByIdBof);
router.put("/:id", confirmDepositBof);
router.delete("/:id", deleteDeposit);
router.post("/", createDepositOfSeller);

module.exports = router;
