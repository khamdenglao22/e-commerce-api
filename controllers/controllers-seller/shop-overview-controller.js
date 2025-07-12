const { Op } = require("sequelize");
const ProductModel = require("../../models/models-seller/product-model");
const ShopOverviewModel = require("../../models/models-seller/shop-overview-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.findSumOverview = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    let dataRating = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "rating",
      },
    });

    if (dataRating === null) dataRating = 0;

    let dataCreditIn = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "credit",
        overview_status: "in",
      },
    });
    if (dataCreditIn === null) dataCreditIn = 0;

    let dataCreditOut = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "credit",
        overview_status: "out",
      },
    });

    if (dataCreditOut === null) dataCreditOut = 0;

    let dataCreditAll = 0;
    dataCreditAll = dataCreditIn - dataCreditOut;
    if (dataCreditAll <= 0) dataCreditAll = 0;

    let dataFollow = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "follow",
      },
    });
    if (dataFollow === null) dataFollow = 0;

    const now = new Date();

    // Today (start and end)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Last 7 days (from 7 days ago to now)
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);

    let dataVisitorToDay = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "visitor",
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    if (dataVisitorToDay === null) dataVisitorToDay = 0;

    let dataVisitor7Days = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "visitor",
        createdAt: {
          [Op.gte]: last7Days,
        },
      },
    });
    if (dataVisitor7Days === null) dataVisitor7Days = 0;

    let dataVisitor30Days = await ShopOverviewModel.sum("overview_value", {
      where: {
        seller_id,
        overview_type: "visitor",
        createdAt: {
          [Op.gte]: last30Days,
        },
      },
    });

    if (dataVisitor30Days === null) dataVisitor30Days = 0;

    let orderToDay = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          as: "order",
          where: {
            order_date: {
              [Op.between]: [todayStart, todayEnd],
            },
          },
        },
        {
          model: ProductModel,
          as: "product",
          where: {
            seller_id,
          },
        },
      ],
      //   where: { order_detail_status: "complete" },
    });

    let orderTodayPrice = 0;
    if (orderToDay.length > 0) {
      orderTodayPrice = orderToDay.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    if (orderToDay.length > 0) {
      orderToDay = orderToDay.map((row) => {
        let total_price = row.price * row.qty;
        if (total_price <= 999) {
          row.dataValues.profit = (total_price * 20) / 100 + total_price;
        } else {
          row.dataValues.profit = (total_price * 35) / 100 + total_price;
        }
        return row;
      });
    }

    let totalProfitToday = 0;
    if (orderToDay.length > 0) {
      totalProfitToday = orderToDay.reduce((sum, item) => sum + item.profit, 0);
    }

    res.status(HTTP_SUCCESS).json({
      dataRating,
      dataCreditAll,
      dataFollow,
      dataVisitorToDay,
      dataVisitor7Days,
      dataVisitor30Days,
      orderToday: orderToDay.length,
      orderTodayPrice,
      totalProfitToday,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
