const { Op, Sequelize } = require("sequelize");
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
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");

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

// exports.findAllOrder = async (req, res) => {
//   const { cus_id } = req.customer;
//   const { page, size, order_status, from_date, to_date } = req.query;
//   const { limit, offset } = getPagination(page, size);
//   let filter = {};
//   if (order_status) {
//     filter = { ...filter, order_status: order_status };
//   }

//   if (from_date && to_date) {
//     const start = new Date(from_date);
//     start.setHours(0, 0, 0, 0); // Start of day

//     const end = new Date(to_date);
//     end.setHours(23, 59, 59, 999); // End of day

//     filter.order_date = {
//       [Op.between]: [start, end],
//     };
//   }
//   try {
//     const order = await OrderModel.findAndCountAll({
//       offset,
//       limit,
//       distinct: true,
//       where: { ...filter, customer_id: cus_id },
//       include: [
//         {
//           model: OrderDetailModel,
//           as: "order_details",
//         },
//       ],
//     });
//     const response = getPagingData(order, page, limit);

//     // console.log(response.result);

//     response.result = response.result.map((orderItem) => {
//       orderItem.dataValues.total_qty = orderItem.order_details.reduce(
//         (sum, detail) => sum + detail.qty,
//         0
//       );
//       return orderItem;
//     });

//     // const totalQty = response.result.order_details.reduce(
//     //   (sum, item) => sum + item.qty,
//     //   0
//     // );
//     // response.result.dataValues.totalQty = totalQty;

//     res.status(HTTP_SUCCESS).json(response);
//   } catch (error) {
//     res
//       .status(HTTP_BAD_REQUEST)
//       .json({ status: HTTP_BAD_REQUEST, msg: error.message });
//   }
// };

exports.findOrderDetail = async (req, res) => {
  const { id } = req.params;
  const { cus_id } = req.customer;
  try {
    const order = await OrderModel.findOne({
      where: { id, customer_id: cus_id },
      include: [
        {
          model: OrderDetailModel,
          as: "order_details",
          attributes: ["id", "qty", "price", "order_detail_status"],
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["id"],
              include: [
                {
                  model: ProductMasterBofModel,
                  as: "product_master",
                  attributes: [
                    "id",
                    "name_en",
                    "name_th",
                    "name_ch",
                    "price",
                    "image",
                    "description_en",
                    "description_th",
                    "description_ch",
                    "long_description_en",
                    "long_description_th",
                    "long_description_ch",
                  ],
                },
              ],
            },
            {
              model: ProductColorOptionModel,
              as: "product_color_details",
            },
            {
              model: ProductSizeOptionModel,
              as: "product_size_details",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Order not found",
      });
    }

    order.order_details = order.order_details.map((our) => {
      if (our.product.product_master.image) {
        our.product.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product.product_master.image}`;
      } else {
        our.product.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    const totalQty = order.order_details.reduce(
      (sum, item) => sum + item.qty,
      0
    );

    order.dataValues.totalQty = totalQty;

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: order });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.findCountOrderAll = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    const orderSuccess = await OrderDetailModel.count({
      where: {
        order_detail_status: ["success", "confirm", "delivery", "rejected"],
      },
      include: [
        {
          model: OrderModel,
          as: "order",
          where: {
            customer_id: cus_id,
          },
        },
      ],
    });

    const orderComplete = await OrderDetailModel.count({
      where: {
        order_detail_status: "complete",
      },
      include: [
        {
          model: OrderModel,
          as: "order",
          where: {
            customer_id: cus_id,
          },
        },
      ],
    });

    res
      .status(HTTP_SUCCESS)
      .json({ status: HTTP_SUCCESS, orderSuccess, orderComplete });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAllOrder = async (req, res) => {
  const { cus_id } = req.customer;
  const { page, size, order_detail_status, from_date, to_date } = req.query;
  const { limit, offset } = getPagination(page, size);
  let filter = {};
  let filterStatus = {};

  if (order_detail_status) {
    filterStatus = {
      ...filterStatus,
      order_detail_status: order_detail_status,
    };
  }

  if (from_date && to_date) {
    const start = new Date(from_date);
    start.setHours(0, 0, 0, 0); // Start of day

    const end = new Date(to_date);
    end.setHours(23, 59, 59, 999); // End of day

    filter.order_date = {
      [Op.between]: [start, end],
    };
  }
  try {
    const order = await OrderDetailModel.findAndCountAll({
      offset,
      limit,
      distinct: true,
      where: { ...filterStatus },
      order: [
        [
          Sequelize.literal(
            "CASE WHEN order_detail_status = 'delivery' THEN 0 ELSE 1 END"
          ),
          "ASC",
        ],
        ["order_detail_status", "ASC"],
      ],
      include: [
        {
          model: OrderModel,
          as: "order",
          where: { ...filter, customer_id: cus_id },
        },
        {
          model: ProductModel,
          as: "product",
          include: {
            model: ProductMasterBofModel,
            as: "product_master",
          },
        },
        {
          model: ProductColorOptionModel,
          as: "product_color_details",
        },
        {
          model: ProductSizeOptionModel,
          as: "product_size_details",
        },
      ],
    });
    const response = getPagingData(order, page, limit);

    response.result = response.result.map((orderItem) => {
      if (orderItem.product.product_master.image) {
        orderItem.dataValues.product.product_master.image = `${PRODUCT_MEDIA_URL}/${orderItem.dataValues.product.product_master.image}`;
      } else {
        orderItem.dataValues.product.product_master.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return orderItem;
    });

    // response.result = response.result.map((orderItem) => {
    //   orderItem.dataValues.total_qty = orderItem.order_details.reduce(
    //     (sum, detail) => sum + detail.qty,
    //     0
    //   );
    //   return orderItem;
    // });

    res.status(HTTP_SUCCESS).json(response);
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.confirmOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const orderDetail = await OrderDetailModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: ProductModel,
          as: "product",
        },
        {
          model: OrderModel,
          as: "order",
        },
      ],
    });

    if (!orderDetail) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Order not found",
      });
    }

    const transaction = await sequelize.transaction();

    orderDetail.order_detail_status = req.body.order_detail_status;
    await orderDetail.save({ transaction });

    const checkOrder = await OrderModel.findOne({
      where: {
        id: orderDetail.order_id,
      },
      include: [
        {
          model: OrderDetailModel,
          as: "order_details",
        },
      ],
    });

    const allConfirm = checkOrder?.dataValues?.order_details?.every(
      (item) => item.order_detail_status === req.body.order_detail_status
    );

    if (allConfirm) {
      checkOrder.order_status = req.body.order_detail_status;
      await checkOrder.save({ transaction });
    }

    transaction.commit();

    res
      .status(HTTP_SUCCESS)
      .json({ status: HTTP_SUCCESS, msg: "Confirm order successfully" });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
