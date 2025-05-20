const router = require("express").Router();
const {
  findSellerAll,
  confirmSeller,
} = require("../../controllers/controllers-bof/seller-bof-controller");

router.get("/", findSellerAll);
router.put("/confirm-seller/:id", confirmSeller);

module.exports = router;
