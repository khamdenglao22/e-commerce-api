const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("./customer-cus-model");
const SellerModel = require("../models-seller/seller-model");

const OrderCusModel = sequelize.define(
  "OrderCus",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CustomerCusModel,
        key: "id",
      },
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SellerModel,
        key: "id",
      },
    },
    status_order: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1,
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = OrderCusModel;
