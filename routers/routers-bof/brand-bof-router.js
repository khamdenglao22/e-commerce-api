const router = require("express").Router();
const {
  findAllBrand,
  findBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  findBrandByCategoryId,
} = require("../../controllers/controllers-bof/brand-bof-controller");

router.get("/", findAllBrand);
router.get("/:id", findBrandById);
router.get("/brand-category/:category_id", findBrandByCategoryId);
router.post("/", createBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
