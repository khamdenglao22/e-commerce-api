const router = require('express').Router()
const {
    findCustomerWallet
} = require("../../controllers/controllers-cus/wallet-cus-controller")

router.get('/', findCustomerWallet)

module.exports = router;