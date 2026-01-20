const router = require("express").Router();

const {
  findBySellerId,
} = require("../../controllers/controllers-seller/vip-seller-controller");

router.get("/", findBySellerId);
module.exports = router;