const router = require("express").Router();
const {
  findOrderSellerList,
  confirmOrderSeller,
} = require("../../controllers/controllers-seller/order-seller-controller");

router.get("/", findOrderSellerList);
router.get("/confirm/:id", confirmOrderSeller);

module.exports = router;
