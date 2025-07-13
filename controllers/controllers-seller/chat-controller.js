const { Op, fn, col, literal } = require("sequelize");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const { HTTP_BAD_REQUEST, HTTP_SUCCESS } = require("../../utils/http_status");
const ProductModel = require("../../models/models-seller/product-model");

exports.findChatProduct = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(startOfToday.getDate() - 6); // last 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const startThirtyDate = new Date();
    startThirtyDate.setDate(endOfToday.getDate() - 29); // Last 30 days including today
    startThirtyDate.setHours(0, 0, 0, 0);

    console.log(startOfToday);
    console.log(endOfToday);

    const orderData = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          as: "order",
          attributes: [],

          where: {
            order_date: {
              [Op.between]: [startOfToday, endOfToday],
            },
          },
        },
        {
          model: ProductModel,
          as: "product",
          attributes: [],
          where: {
            seller_id,
          },
        },
      ],
      attributes: [
        [
          fn(
            "HOUR",
            literal("CONVERT_TZ(order.order_date, '+00:00', '+07:00')")
          ),
          "hour",
        ],
        [fn("SUM", literal("qty * price")), "total_amount"],
      ],
      group: [literal("CONVERT_TZ(order.order_date, '+00:00', '+07:00')")],
      raw: true,
      where: { order_detail_status: "complete" },
    });

    const data = Array(24).fill(0);

    orderData.forEach((row) => {
      const hour = parseInt(row.hour);
      const amount = parseFloat(row.total_amount);
      data[hour] = amount;
    });

    // Step 4: Prepare labels
    const labels = Array.from(
      { length: 24 },
      (_, i) => i.toString().padStart(2, "0") + "h"
    );

    const orderData7Day = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          as: "order",
          attributes: [],
          where: {
            order_date: {
              [Op.between]: [sevenDaysAgo, endOfToday],
            },
          },
        },
        {
          model: ProductModel,
          as: "product",
          attributes: [],
          where: {
            seller_id,
          },
        },
      ],
      attributes: [
        [
          fn(
            "DAY",
            literal("CONVERT_TZ(order.order_date, '+00:00', '+07:00')")
          ),
          "day",
        ],
        [fn("SUM", literal("qty * price")), "total_amount"],
      ],
      group: [literal("DAY(CONVERT_TZ(order.order_date, '+00:00', '+07:00'))")],
      raw: true,
      where: { order_detail_status: "complete" },
    });

    const labels7Day = [];
    const data7Day = [];

    // Create a map from day to total_amount for quick lookup
    const dayMap = new Map();
    orderData7Day.forEach((row) => {
      dayMap.set(row.day, parseFloat(row.total_amount));
    });

    // Fill labels and data for each day from sevenDaysAgo to today
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const dayNum = d.getDate();

      labels7Day.push(dayNum);
      data7Day.push(dayMap.get(dayNum) || 0);
    }

    // const data2 = { labels7Day, data7Day };

    // last 30 day ago

    const orderDataThirtyDay = await OrderDetailModel.findAll({
      include: [
        {
          model: OrderModel,
          as: "order",
          attributes: [],
          where: {
            order_date: {
              [Op.between]: [startThirtyDate, endOfToday],
            },
          },
        },
        {
          model: ProductModel,
          as: "product",
          attributes: [],
          where: {
            seller_id,
          },
        },
      ],
      attributes: [
        [
          fn(
            "DATE",
            literal("CONVERT_TZ(order.order_date, '+00:00', '+07:00')")
          ),
          "order_day",
        ],
        [fn("SUM", literal("qty * price")), "total_amount"],
      ],
      group: [
        literal("DATE(CONVERT_TZ(order.order_date, '+00:00', '+07:00'))"),
      ],
      raw: true,
      where: { order_detail_status: "complete" },
    });

    const resultThirtyMap = new Map();
    orderDataThirtyDay.forEach((row) => {
      resultThirtyMap.set(row.order_day, parseFloat(row.total_amount));
    });

    const labelsThirtyDay = [];
    const dataThirtyDay = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(startThirtyDate);
      date.setDate(startThirtyDate.getDate() + i);

      const dayString = date.toISOString().slice(0, 10); // e.g. "2025-07-12"
      const dayLabel = date.getDate().toString(); // only day number, e.g. "12"

      labelsThirtyDay.push(dayLabel);
      dataThirtyDay.push(resultThirtyMap.get(dayString) || 0);
    }

    // Step 5: Send result as JSON
    res.json({
      dataToDay: {
        labels,
        data,
      },
      data7Day: { labels: labels7Day, data: data7Day },
      dataThirtyDay: { labels: labelsThirtyDay, data: dataThirtyDay },
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
