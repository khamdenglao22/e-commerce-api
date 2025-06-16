const router = require("express").Router();
const {
  findSellerAll,
  confirmSeller,
  findSellerById,
} = require("../../controllers/controllers-bof/seller-bof-controller");

router.get("/", findSellerAll);
router.get("/:id", findSellerById);
router.put("/confirm-seller/:id", confirmSeller);

module.exports = router;
