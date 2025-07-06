const router = require("express").Router();
const {
  createOrder,
  findAllOrder,
  findOrderDetail,
  findCountOrderAll,
  confirmOrder,
} = require("../../controllers/controllers-cus/order-controller");

router.get("/", findAllOrder);
router.get("/count", findCountOrderAll);
router.get("/:id", findOrderDetail);
router.put("/confirm-order/:id", confirmOrder);
router.post("/", createOrder);

module.exports = router;
