const router = require("express").Router();
const {
  totalCountAll,
} = require("../../controllers/controllers-bof/count-bof-controller");

router.get("/", totalCountAll);

module.exports = router;