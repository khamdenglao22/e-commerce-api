const router = require("express").Router();
const {
  findAll,
  findById,
  create,
  update,
  deleteById,
  findAllAccount,
  createAccount,
  deleteAccountById,
  updateAccount,
} = require("../../controllers/controllers-bof/company-controller");

// Route order matters!
router.get("/account", findAllAccount);
router.post("/account", createAccount);
router.delete("/account/:id", deleteAccountById);
router.put("/account/:id", updateAccount);

router.get("/", findAll);
router.post("/", create);
router.get("/:id", findById);
router.put("/:id", update);
router.delete("/:id", deleteById);

module.exports = router;
