const router = require("express").Router();
const {
  createProductGallery,
  getProductGallery,
  deleteProductGallery,
} = require("../../controllers/controllers-bof/product-gallery-bof-controller");

router.post("/", createProductGallery);
router.get("/get-gallery/:p_id", getProductGallery);
router.delete("/:id", deleteProductGallery);

module.exports = router;
