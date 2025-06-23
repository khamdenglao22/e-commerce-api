const router = require("express").Router();
const {
  findAllImage,
  findImageById,
  createImage,
  deleteImage,
} = require("../../controllers/controllers-bof/slide-image-controller");

router.get("/", findAllImage);
router.get("/:id", findImageById);
router.post("/", createImage);
router.delete("/:id", deleteImage);

module.exports = router;
