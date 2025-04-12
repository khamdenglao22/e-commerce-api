const router = require("express").Router();

const {
  loginCustomer,
} = require("../../controllers/controllers-cus/auth-cus-controller");

router.post("/", loginCustomer);

module.exports = router;
