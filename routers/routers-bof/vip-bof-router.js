const router = require("express").Router();

const {
  findBySellerId,
} = require("../../controllers/controllers-bof/vip-bof-controller");

router.get("/:id", findBySellerId);
module.exports = router;
