const router = require("express").Router();
const {
  findAllDepositBof,
  findDepositByIdBof,
  confirmDepositBof,
} = require("../../controllers/controllers-bof/deposit-bof-controller");

router.get("/", findAllDepositBof);
router.get("/:id", findDepositByIdBof);
router.put("/:id", confirmDepositBof);

module.exports = router;
