const router = require("express").Router();
const {
  findAllOrderBof,
  confirmOrderBof,
} = require("../../controllers/controllers-bof/order-bof-controller");

router.put("/confirm/:id", confirmOrderBof);
router.get("/", findAllOrderBof);

module.exports = router;
