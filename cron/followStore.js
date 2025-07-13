const cron = require("node-cron");
const ShopOverviewModel = require("../models/models-seller/shop-overview-model");
const SellerModel = require("../models/models-seller/seller-model");

const followStore = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily task...");
    try {
      const radomData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const randomValue =
        radomData[Math.floor(Math.random() * radomData.length)];
      const dataSeller = await SellerModel.findAll({
        where: { seller_status: "active" },
      });

      await ShopOverviewModel.bulkCreate(
        dataSeller.map((data) => ({
          seller_id: data.id,
          overview_value: randomValue,
          overview_type: "visitor",
        }))
      );

      console.log("Insert successfully....");
    } catch (err) {
      console.error("Insert failed:", err);
    }
  });
};

module.exports = followStore;
