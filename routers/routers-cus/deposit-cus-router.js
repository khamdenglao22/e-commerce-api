const router = require("express").Router();

const {
  findAllDepositCus,
  findDepositByIdCus,
  createDepositCus,
} = require("../../controllers/controllers-cus/deposit-cus-controller");

router.get("/", findAllDepositCus);
router.get("/:id", findDepositByIdCus);
router.post("/", createDepositCus);

module.exports = router
