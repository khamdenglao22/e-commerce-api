const router = require("express").Router();
const {
  findSellerById,
  updateSeller,
} = require("../../controllers/controllers-seller/seller-controller");

const {
  getCurrentSeller,
} = require("../../controllers/controllers-seller/auth-seller-controller");

router.get("/", getCurrentSeller, findSellerById);
router.put("/", getCurrentSeller, updateSeller);

module.exports = router;
