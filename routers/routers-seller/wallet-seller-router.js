const router = require('express').Router();
const { findSumWallet } = require("../../controllers/controllers-seller/wallet-seller-controller");

router.get('/',findSumWallet)

module.exports = router

