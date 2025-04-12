const router = require("express").Router();
const {
  findAllRoles,
  findRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../../controllers/controllers-bof/role-bof-controller");

router.get("/", findAllRoles);
router.get("/:id", findRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

module.exports = router;
