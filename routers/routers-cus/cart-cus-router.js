const router = require("express").Router();
const {
  findCartByCustomer,
  addToCart,
  updateAddToCart,
  updateRemoveCart,
  deleteCart,
} = require("../../controllers/controllers-cus/cart-cus-controller");

router.get("/", findCartByCustomer);
router.post("/add-to-cart", addToCart);
router.put("/update-add-to-cart/:id", updateAddToCart);
router.put("/update-remove-cart/:id", updateRemoveCart);
router.delete("/delete-cart/:id", deleteCart);


module.exports = router;

//
