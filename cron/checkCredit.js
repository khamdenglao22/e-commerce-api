const cron = require("node-cron");
const { Op } = require("sequelize");
const OrderDetailModel = require("../models/order-detail-model");
const OrderModel = require("../models/order-model");
const SellerModel = require("../models/models-seller/seller-model");
const ProductModel = require("../models/models-seller/product-model");
const ShopOverviewModel = require("../models/models-seller/shop-overview-model");

const checkCredit = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running check credit ...");

    try {
      const dataSeller = await SellerModel.findAll({
        where: { seller_status: "active" },
      });

      for (let index = 0; index < dataSeller.length; index++) {
        const order = await OrderDetailModel.findOne({
          include: [
            {
              model: OrderModel,
              as: "order",
              where: {
                order_date: {
                  [Op.ne]: null,
                },
              },
            },
            {
              model: ProductModel,
              as: "product",
              where: {
                seller_id: dataSeller[index].id,
              },
            },
          ],
          order: [[{ model: OrderModel, as: "order" }, "order_date", "ASC"]],
          where: { order_detail_status: "success" },
        });

        const targetDate = new Date(order.dataValues.order.order_date); // your input date
        const today = new Date();

        // Get only the date part (ignore time)
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Calculate difference in milliseconds
        const diffTime = today - targetDate;

        // Convert to days
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 3) {
          console.log(
            `✅ Date is exactly ${diffDays} days ago ${dataSeller[index].id}`
          );
          await ShopOverviewModel.create({
            seller_id: dataSeller[index].id,
            overview_value: 1,
            overview_type: "credit",
            overview_status: "out",
          });

          let dataCreditIn = await ShopOverviewModel.sum("overview_value", {
            where: {
              seller_id: dataSeller[index].id,
              overview_type: "credit",
              overview_status: "in",
            },
          });
          if (dataCreditIn === null) dataCreditIn = 0;

          let dataCreditOut = await ShopOverviewModel.sum("overview_value", {
            where: {
              seller_id: dataSeller[index].id,
              overview_type: "credit",
              overview_status: "out",
            },
          });
          if (dataCreditOut === null) dataCreditOut = 0;

          if (dataCreditIn - dataCreditOut === 0) {
            await SellerModel.update(
              { seller_status: "block" },
              { where: { seller_id: dataSeller[index].id } }
            );
          }
        } else {
          console.log(`❌ Date is ${diffDays} days ago`);
        }
      }

      //   console.log("Insert successfully....", order.dataValues);
    } catch (err) {
      console.error("check failed:", err);
    }
  });
};

module.exports = checkCredit;
