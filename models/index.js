const VipModel = require("./models-cus/vip-model");
const SellerModel = require("./models-seller/seller-model");

SellerModel.hasMany(VipModel, {
  foreignKey: "seller_id",
  as: "vips",
});

VipModel.belongsTo(SellerModel, {
  foreignKey: "seller_id",
  as: "seller",
});

module.exports = {
  SellerModel,
  VipModel,
};