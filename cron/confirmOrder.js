const cron = require("node-cron");
const ShopOverviewModel = require("../models/models-seller/shop-overview-model");
const SellerModel = require("../models/models-seller/seller-model");
const OrderDetailModel = require("../models/order-detail-model");
const ProductModel = require("../models/models-seller/product-model");
const OrderModel = require("../models/order-model");
const sequelize = require("../config");
const { Op } = require("sequelize");

const confirmOrderAuto = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily task confirm order auto...");
    const transaction = await sequelize.transaction();

    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 15);

      // OR if using date-fns: const fiveDaysAgo = subDays(new Date(), 5);

      let orderDetail = await OrderDetailModel.findAll({
        include: [
          {
            model: ProductModel,
            as: "product",
          },
          {
            model: OrderModel,
            as: "order",
            where: {
              order_date: {
                [Op.lt]: fiveDaysAgo, // order_date < 5 days ago
              },
            },
          },
        ],
        where: {
          order_detail_status: "confirm",
        },
      });

      // Step 1: Update order_detail_status to 'complete'
      await Promise.all(
        orderDetail.map(async (item) => {
          item.order_detail_status = "complete";
          await item.save({ transaction });

          // Step 2: Update order status to 'complete' if all details are complete
          const checkOrder = await OrderModel.findOne({
            where: {
              id: item.order_id,
            },
            include: [
              {
                model: OrderDetailModel,
                as: "order_details",
              },
            ],
          });

          const allComplete = checkOrder?.order_details?.every(
            (d) => d.order_detail_status === "complete"
          );

          if (allComplete) {
            checkOrder.order_status = "complete";
            await checkOrder.save({ transaction });
          }
        })
      );

      const now = new Date();
      // Today (start and end)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      let dataOrderToDay = await OrderDetailModel.findAll({
        include: [
          {
            model: ProductModel,
            as: "product",
          },
          {
            model: OrderModel,
            as: "order",
            where: {
              order_date: {
                [Op.between]: [todayStart, todayEnd],
              },
            },
          },
        ],
        where: {
          order_detail_status: "complete",
        },
      });

      for (let i = 0; i < dataOrderToDay.length; i++) {
        const sellerId = dataOrderToDay[i].product.seller_id;
        // Follow logic with random value
        const randomValue = [1, 2, 3][Math.floor(Math.random() * 3)];
        await ShopOverviewModel.create(
          {
            seller_id: sellerId,
            overview_value: randomValue,
            overview_type: "follow",
          },
          { transaction }
        );
      }

      // Final commit
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Transaction failed:", error);
      throw error;
    }
  });
};

module.exports = confirmOrderAuto;
