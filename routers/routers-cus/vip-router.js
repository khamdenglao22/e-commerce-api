const router = require("express").Router();
const {
  createVip,
} = require("../../controllers/controllers-cus/vip-controller");

router.post("/", createVip);

module.exports = router;
