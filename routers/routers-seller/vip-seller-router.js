const router = require("express").Router();

const {
  findBySellerId,
  upgradeVip
} = require("../../controllers/controllers-seller/vip-seller-controller");

router.get("/", findBySellerId);
router.post("/upgrade", upgradeVip);
module.exports = router;