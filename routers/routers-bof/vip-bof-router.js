const router = require("express").Router();

const {
  findBySellerId,
  confirmUpgradeVip
} = require("../../controllers/controllers-bof/vip-bof-controller");

router.get("/:id", findBySellerId);
router.put("/confirm-upgrade/:id", confirmUpgradeVip);
module.exports = router;
