const router = require("express").Router();
const {
  createSeller,
  findSellerById,
  updateSeller,
} = require("../../controllers/controllers-seller/seller-controller");

router.post("/", createSeller);
router.get("/", findSellerById);
router.put("/", updateSeller);

module.exports = router;
