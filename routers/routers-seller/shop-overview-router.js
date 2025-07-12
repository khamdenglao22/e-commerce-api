const router = require("express").Router();
const {
  findSumOverview,
} = require("../../controllers/controllers-seller/shop-overview-controller");

router.get("/", findSumOverview);

module.exports = router;
