const router = require("express").Router();
const {
  findCartByCustomer,
  addToCart,
} = require("../../controllers/controllers-cus/cart-cus-controller");

router.get("/", findCartByCustomer);
router.post("/add-to-cart", addToCart);

module.exports = router;

//
