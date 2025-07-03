const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const OrderModel = require("../order-model");
const OrderDetailModel = require("../order-detail-model");

const WalletSellerModel = sequelize.define(
  "WalletSellerModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    wallet_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deposit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    withdraw_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "wallet_seller",
    timestamps: true,
  }
);

WalletSellerModel.belongsTo(OrderDetailModel, {
  foreignKey: "order_detail_id",
  as: "order_details",
});

module.exports = WalletSellerModel;
