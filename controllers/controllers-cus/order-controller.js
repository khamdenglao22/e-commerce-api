const { Op } = require("sequelize");
const sequelize = require("../../config");
const CartCusModel = require("../../models/models-cus/cart-cus-model");
const ProductModel = require("../../models/models-seller/product-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const {
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_SUCCESS,
} = require("../../utils/http_status");

exports.createOrder = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    const cartData = await CartCusModel.findAll({
      where: { customer_id: cus_id },
    });

    if (!cartData) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart is empty",
      });
    }

    const totalAmount = cartData.reduce(
      (sum, item) => sum + item.qty * item.cart_price,
      0
    );

    const transaction = await sequelize.transaction();

    const createOrder = await OrderModel.create(
      {
        customer_id: cus_id,
        total_amount: totalAmount,
        shipping_address: req.body.shipping_address,
      },
      { transaction }
    );

    await OrderDetailModel.bulkCreate(
      cartData.map((item) => ({
        order_id: createOrder.id,
        product_id: item.product_id,
        qty: item.qty,
        price: item.cart_price,
        product_size_id: item.product_size_id,
        product_color_id: item.product_color_id,
      })),
      { transaction }
    );

    await CartCusModel.destroy({
      where: { customer_id: cus_id },
      transaction,
    });

    transaction.commit();

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "Order created successfully",
      data: createOrder,
    });
  } catch (err) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: err.message });
  }
};

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.findAllOrder = async (req, res) => {
  const { cus_id } = req.customer;
  const { page, size, order_status, from_date, to_date } = req.query;
  const { limit, offset } = getPagination(page, size);
  let filter = {};
  if (order_status) {
    filter = { ...filter, order_status: order_status };
  }

  if (from_date && to_date) {
    const start = new Date(from_date);
    start.setHours(0, 0, 0, 0); // Start of day

    const end = new Date(to_date);
    end.setHours(23, 59, 59, 999); // End of day

    filter.createdAt = {
      [Op.between]: [start, end],
    };
  }
  try {
    const order = await OrderModel.findAndCountAll({
      offset,
      limit,
      where: { ...filter, customer_id: cus_id },
    });

    const response = getPagingData(order, page, limit);
    res.status(HTTP_SUCCESS).json(response);
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
