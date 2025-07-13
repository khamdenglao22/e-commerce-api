const { Sequelize, Op } = require("sequelize");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const ProductModel = require("../../models/models-seller/product-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
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

exports.findOrderSellerList = async (req, res) => {
  const { seller_id } = req.seller;
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
            "CASE WHEN order_detail_status = 'success' THEN 0 ELSE 1 END"
          ),
          "ASC",
        ],
        ["order_detail_status", "ASC"],
      ],
      include: [
        {
          model: OrderModel,
          as: "order",
          include: {
            model: CustomerCusModel,
            as: "customer",
          },
          where: { ...filter },
        },
        {
          model: ProductModel,
          as: "product",
          include: {
            model: ProductMasterBofModel,
            as: "product_master",
          },
          where: {
            seller_id: seller_id,
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

exports.confirmOrderSeller = async (req, res) => {
  const { id } = req.params;
  const { seller_id } = req.seller;
  try {
    const orderDetail = await OrderDetailModel.findOne({
      where: {
        id,
      },
    });

    if (!orderDetail) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Order not found",
      });
    }

    orderDetail.order_detail_status = "confirm";
    await orderDetail.save();

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
      (item) => item.order_detail_status === "confirm"
    );

    const transaction = await sequelize.transaction();

    if (allConfirm) {
      checkOrder.order_status = "confirm";
      await checkOrder.save({ transaction });
    }

    // bonus form sale
    let bonus = 0;

    if (orderDetail.order_detail_status === "confirm") {
      const total_price =
        orderDetail.dataValues.price * orderDetail.dataValues.qty;

      if (total_price <= 999) {
        bonus = (total_price * 20) / 100 + total_price;
      } else {
        bonus = (total_price * 35) / 100 + total_price;
      }

      await WalletSellerModel.create(
        {
          balance: 0,
          bonus: bonus,
          wallet_type: "profit",
          seller_id: seller_id,
          order_detail_id: orderDetail.dataValues.id,
        },
        { transaction }
      );
    }

    // Rating logic
    const completeCount = await OrderDetailModel.count({
      where: {
        order_detail_status: "confirm",
      },
      include: [
        {
          model: ProductModel,
          as: "product",
          where: { seller_id },
        },
      ],
    });

    let checkRating = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "rating",
      },
    });

    if (checkRating === null) checkRating = 0;

    let overviewValue = 0;

    if (checkRating < 5) {
      if (completeCount > 1) overviewValue = 1;

      if (overviewValue > 0) {
        await ShopOverviewModel.create(
          {
            seller_id,
            overview_value: overviewValue,
            overview_type: "rating",
          },
          { transaction }
        );
      }
    }

    console.log(`all Confirm : ${allConfirm}`);

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

exports.findCountOrder = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    const totalNewOrder = await OrderDetailModel.count({
      where: {
        order_detail_status: "success",
      },
      include: [
        {
          model: ProductModel,
          as: "product",
          where: { seller_id },
        },
      ],
    });

    const totalAllOrder = await OrderDetailModel.count({
      include: [
        {
          model: ProductModel,
          as: "product",
          where: { seller_id },
        },
      ],
    });

    res.status(HTTP_SUCCESS).json({ totalNewOrder, totalAllOrder });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
