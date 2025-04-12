const router = require("express").Router();
const {
  findAllCategory,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/controllers-bof/category-bof-controller");

router.get("/", findAllCategory);
router.get("/:id", findCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;