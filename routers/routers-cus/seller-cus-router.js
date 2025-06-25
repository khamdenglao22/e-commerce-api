const router = require("express").Router();
const {
  findSellerByCusId,
  createSeller,
} = require("../../controllers/controllers-cus/seller-cus-controller");

router.get("/", findSellerByCusId);
router.post("/", createSeller);

module.exports = router;
