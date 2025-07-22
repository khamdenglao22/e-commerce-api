const router = require("express").Router();
const {
  findAllWithdrawBof,
  findWithdrawByIdBof,
  confirmWithdrawBof,
  deleteWithdraw,
} = require("../../controllers/controllers-bof/withdraw-seller-bof-controller");

router.get("/", findAllWithdrawBof);
router.get("/:id", findWithdrawByIdBof);
router.put("/:id", confirmWithdrawBof);
router.delete("/:id", deleteWithdraw);

module.exports = router;
