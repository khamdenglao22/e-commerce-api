const router = require("express").Router();

const {
  findBySellerId,
  confirmUpgradeVip,
  rejectVip
} = require("../../controllers/controllers-bof/vip-bof-controller");

router.get("/:id", findBySellerId);
router.put("/confirm-upgrade/:id", confirmUpgradeVip);
router.put("/reject-upgrade/:id", rejectVip);
module.exports = router;
