const router = require("express").Router();
const {
  createOrder,
  findAllOrder,
} = require("../../controllers/controllers-cus/order-controller");

router.get("/", findAllOrder);
router.post("/", createOrder);

module.exports = router;
