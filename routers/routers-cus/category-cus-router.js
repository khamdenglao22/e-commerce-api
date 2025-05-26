const router = require("express").Router();
const {
  customerFindCategory,
  customerFindCategoryById,
} = require("../../controllers/controllers-cus/category-cus-controller");

router.get("/", customerFindCategory);
router.get("/get-category-by-id", customerFindCategoryById);

module.exports = router;
