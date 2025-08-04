const router = require("express").Router();
const {
  findCompanyByCurrency,
  findAll,
} = require("../../controllers/controllers-cus/company-cus-controller");

router.get("/all", findAll);
// Route to find company by currency

router.get("/", findCompanyByCurrency);


module.exports = router;
