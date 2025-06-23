const router = require("express").Router();
const {
  createSeller,
  findSellerById,
  updateSeller,
} = require("../../controllers/controllers-seller/seller-controller");

const {
  getCurrentCustomer,
} = require("../../controllers/controllers-cus/auth-cus-controller");
const {
  getCurrentSeller,
} = require("../../controllers/controllers-seller/auth-seller-controller");

router.post("/",getCurrentCustomer, createSeller);
router.get("/",getCurrentSeller, findSellerById);
router.put("/",getCurrentSeller, updateSeller);

module.exports = router;
