const router = require("express").Router();
const {
  findAllOrderBof,
  confirmOrderBof,
  orderAutoBof,
} = require("../../controllers/controllers-bof/order-bof-controller");

router.put("/confirm/:id", confirmOrderBof);
router.post("/order-auto/:id", orderAutoBof);
router.get("/", findAllOrderBof);

module.exports = router;
