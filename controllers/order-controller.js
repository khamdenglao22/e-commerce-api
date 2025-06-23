const OrderModel = require("../models/order-model");
const { HTTP_NOT_FOUND } = require("../utils/http_status");

exports.createOrder = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    const cartData = await CartModel.findAll({
      where: { customer_id: cus_id },
    });

    if (!cartData) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart is empty",
      });
    }

    const totalAmount = cartData.reduce(
      (sum, item) => sum + item.qty * item.product.product_master.price,
      0
    );

    const newProduct = await OrderModel.bulkCreate(
      product_id.map((id) => ({ seller_id, product_id: id }))
    );

    


  } catch (err) {}
};
