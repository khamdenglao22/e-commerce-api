const router = require("express").Router();
const {
  findBrandSearch,
  findSellerSearch,
  findCategorySearch,
} = require("../../controllers/controllers-cus/search-cus-controller");

router.get("/search-category", findCategorySearch);
router.get("/search-brand", findBrandSearch);
router.get("/search-store", findSellerSearch);

module.exports = router;
