const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const WalletCusModel = sequelize.define(
  "WalletCusModel",
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
    customer_id: {
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
    tableName: "wallet_customer",
    timestamps: true,
  }
);

module.exports = WalletCusModel;
