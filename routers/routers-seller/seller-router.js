const router = require("express").Router();
const {
  createSeller,
} = require("../../controllers/controllers-seller/seller-controller");
const {
  getCurrentCustomer,
} = require("../../controllers/controllers-cus/auth-cus-controller");

router.post("/", getCurrentCustomer, createSeller);

module.exports = router;
