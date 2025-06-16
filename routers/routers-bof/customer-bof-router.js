const router = require("express").Router();
const {
  findCustomerAll,
  findCustomerById,
  updateCustomerStatus,
  createCustomer,
  updateCustomerById,
} = require("../../controllers/controllers-bof/customer-bof-controller");

router.get("/", findCustomerAll);
router.get("/:id", findCustomerById);
router.put("/confirm-customer/:id", updateCustomerStatus);
router.put("/:id", updateCustomerById);
router.post("/", createCustomer);

module.exports = router;
