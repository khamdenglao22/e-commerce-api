const router = require("express").Router();
const {
  createCustomer,
  getCustomerById,
} = require("../../controllers/controllers-cus/customer-cus-controller");

const {
  getCurrentCustomer,
} = require("../../controllers/controllers-cus/auth-cus-controller");

router.post("/", createCustomer);
router.get("/", getCurrentCustomer, getCustomerById);

module.exports = router;
