const router = require("express").Router();
const {
  findCompanyByCurrency,
} = require("../../controllers/controllers-cus/company-cus-controller");

router.get("/", findCompanyByCurrency);

module.exports = router;
