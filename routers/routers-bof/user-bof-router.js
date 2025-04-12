const router = require("express").Router();
const {
  findAllUser,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  changeStatus,
} = require("../../controllers/controllers-bof/user-bof-controller");

router.get("/", findAllUser);
router.get("/:id", findUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/change-password/:id", changePassword);
router.put("/change-status/:id", changeStatus);

module.exports = router;
