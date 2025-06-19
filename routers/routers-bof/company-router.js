const router = require("express").Router();
const {
  findAll,
  findById,
  create,
  update,
  deleteById,
} = require("../../controllers/controllers-bof/company-controller");

router.get("/", findAll);
router.get("/:id", findById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteById);

module.exports = router;
