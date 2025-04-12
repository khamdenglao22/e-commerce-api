const router = require("express").Router();
const {
  loginUser,
} = require("../../controllers/controllers-bof/auth-bof-controller");

router.post("/", loginUser);

module.exports = router;
