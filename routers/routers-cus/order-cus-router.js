const router = require("express").Router();
const {
  createOrder,
  findAllOrder,
  findOrderDetail,
} = require("../../controllers/controllers-cus/order-controller");

router.get("/", findAllOrder);
router.get("/:id", findOrderDetail);
router.post("/", createOrder);

module.exports = router;
