const router = require("express").Router();
const {
  findOrderSellerList,
  confirmOrderSeller,
  findCountOrder,
} = require("../../controllers/controllers-seller/order-seller-controller");

router.get("/", findOrderSellerList);
router.get("/count-order", findCountOrder);
router.put("/confirm/:id", confirmOrderSeller);

module.exports = router;
