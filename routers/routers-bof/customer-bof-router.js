const router = require("express").Router();
const {
  findCustomerAll,
  findCustomerById,
  updateCustomerStatus,
  createCustomer,
  updateCustomerById,
  findCustomerWallet,
} = require("../../controllers/controllers-bof/customer-bof-controller");

router.get("/", findCustomerAll);
router.get("/:id", findCustomerById);
router.put("/confirm-customer/:id", updateCustomerStatus);
router.put("/:id", updateCustomerById);
router.post("/", createCustomer);

router.get("/wallet/:id", findCustomerWallet);

module.exports = router;
