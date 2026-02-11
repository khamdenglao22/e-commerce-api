const router = require("express").Router();
const {
  createVip,
  checkVip,
} = require("../../controllers/controllers-cus/vip-controller");

router.post("/", createVip);
router.get("/check-vip", checkVip);

module.exports = router;
