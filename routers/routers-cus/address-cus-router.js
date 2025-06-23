const router = require('express').Router();
const {
  findAllAddressByCustomer,
  createAddressByCustomer,
  updateAddressByCustomer,
  findAllAddressByCustomerId
} = require('../../controllers/controllers-cus/address-cus-controller');

// Define routes for address management
router.get('/', findAllAddressByCustomer);
router.get('/:id', findAllAddressByCustomerId);
router.post('/', createAddressByCustomer);
router.put('/:id', updateAddressByCustomer);

module.exports = router;