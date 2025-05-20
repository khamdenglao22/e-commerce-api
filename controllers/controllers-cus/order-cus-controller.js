const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const CartCusModel = require("../../models/models-cus/cart-cus-model");
const ProductModel = require("../../models/models-seller/product-model");
const { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_NOT_FOUND } = require("../../utils/http_status");

exports.createOrder = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    let cart = await CartCusModel.findAll({
      where: { customer_id: cus_id },
      attributes: { exclude: ["product_id"] },
      include: [
        {
          model: ProductModel,
          as: "product",
          attributes: { exclude: ["product_id"] },
        },
      ],
    });
    if (!cart) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart not found",
      });
    }
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.qty * item.product.product_master.price,
      0
    );

    const order = await OrderModel.create(orderData);

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: order,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
