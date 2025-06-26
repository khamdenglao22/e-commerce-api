const router = require("express").Router();
const {
  createOrder,
  findAllOrder,
  findOrderDetail,
  findCountOrderAll,
} = require("../../controllers/controllers-cus/order-controller");

router.get("/", findAllOrder);
router.get("/count", findCountOrderAll);
router.get("/:id", findOrderDetail);
router.post("/", createOrder);

module.exports = router;
