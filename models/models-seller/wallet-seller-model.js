const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const WalletSellerModel = sequelize.define(
  "WalletSellerModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bonus: {
      type: DataTypes.INTEGER,
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
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "wallet_seller",
    timestamps: true,
  }
);

module.exports = WalletSellerModel;
