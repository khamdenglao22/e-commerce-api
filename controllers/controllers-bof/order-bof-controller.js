const { Sequelize } = require("sequelize");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const ProductModel = require("../../models/models-seller/product-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const SellerModel = require("../../models/models-seller/seller-model");
const { BASE_MEDIA_URL, PRODUCT_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const AddressCusModel = require("../../models/models-cus/address-cus-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const sequelize = require("../../config");
const ShopOverviewModel = require("../../models/models-seller/shop-overview-model");

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

// exports.findAllOrderBof = async (req, res) => {
//   const { page, size, order_status, from_date, to_date } = req.query;
//   const { limit, offset } = getPagination(page, size);
//   let filter = {};

//   const orderStatusFilter =
//     order_status === undefined || order_status === "" || order_status === null
//       ? ["confirm", "rejected", "delivery", "complete"]
//       : order_status;

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
//       where: { ...filter, order_status: orderStatusFilter },
//       order: [
//         [
//           Sequelize.literal(
//             "CASE WHEN order_status = 'confirm' THEN 0 ELSE 1 END"
//           ),
//           "ASC",
//         ],
//         ["order_status", "ASC"],
//       ],
//       include: [
//         {
//           model: OrderDetailModel,
//           as: "order_details",
//           where: { order_detail_status: orderStatusFilter },
//           include: [
//             {
//               model: ProductModel,
//               as: "product",
//               include: {
//                 model: ProductMasterBofModel,
//                 as: "product_master",
//               },
//             },
//             {
//               model: ProductColorOptionModel,
//               as: "product_color_details",
//             },
//             {
//               model: ProductSizeOptionModel,
//               as: "product_size_details",
//             },
//           ],
//         },
//         {
//           model: CustomerCusModel,
//           as: "customer",
//         },
//         {
//           model: AddressCusModel,
//           as: "address",
//         },
//       ],
//     });
//     const response = getPagingData(order, page, limit);

//     response.result = response.result.map((orderItem) => {
//       orderItem.dataValues.order_details =
//         orderItem.dataValues.order_details.map((detail) => {
//           if (detail.dataValues.product.product_master.image) {
//             detail.dataValues.product.product_master.image = `${PRODUCT_MEDIA_URL}/${detail.dataValues.product.product_master.image}`;
//           } else {
//             detail.dataValues.product.product_master.image = `${BASE_MEDIA_URL}/600x400.svg`;
//           }
//           return detail;
//         });
//       return orderItem;
//     });

//     // console.log(response.result);

//     response.result = response.result.map((orderItem) => {
//       orderItem.dataValues.total_qty = orderItem.order_details.reduce(
//         (sum, detail) => sum + detail.qty,
//         0
//       );
//       return orderItem;
//     });

//     res.status(HTTP_SUCCESS).json(response);
//   } catch (error) {
//     res
//       .status(HTTP_BAD_REQUEST)
//       .json({ status: HTTP_BAD_REQUEST, msg: error.message });
//   }
// };

exports.findAllOrderBof = async (req, res) => {
  const { page, size, order_detail_status, from_date, to_date } = req.query;
  const { limit, offset } = getPagination(page, size);
  let filter = {};
  let filterStatus = {};

  const orderStatusFilter =
    order_detail_status === undefined ||
    order_detail_status === "" ||
    order_detail_status === null
      ? ["confirm", "rejected", "delivery", "complete", "success"]
      : order_detail_status;

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
      where: { order_detail_status: orderStatusFilter },
      order: [
        [
          Sequelize.literal(
            "CASE WHEN order_detail_status = 'confirm' THEN 0 ELSE 1 END"
          ),
          "ASC",
        ],
        ["order_detail_status", "ASC"],
      ],
      include: [
        {
          model: OrderModel,
          as: "order",
          include: [
            {
              model: CustomerCusModel,
              as: "customer",
            },
            {
              model: AddressCusModel,
              as: "address",
            },
          ],
          where: { ...filter },
        },
        {
          model: ProductModel,
          as: "product",
          include: [
            {
              model: ProductMasterBofModel,
              as: "product_master",
            },
            {
              model: SellerModel,
              as: "seller",
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

exports.confirmOrderBof = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user;
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
    orderDetail.reason = req.body.reason;
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
