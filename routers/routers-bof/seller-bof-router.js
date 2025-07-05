const router = require("express").Router();
const {
  findSellerAll,
  confirmSeller,
  findSellerById,
  findSumWallet,
} = require("../../controllers/controllers-bof/seller-bof-controller");

router.get("/", findSellerAll);
router.get("/:id", findSellerById);
router.put("/confirm-seller/:id", confirmSeller);

router.get("/wallet/:seller_id", findSumWallet);

module.exports = router;
