const router = require("express").Router();
const {
  updateCredit,
} = require("../../controllers/controllers-bof/seller-credit-bof-controller");

router.put("/:id", updateCredit);

module.exports = router;
