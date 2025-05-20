const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const OrderCusModel = require("./order-cus-model");
const ProductMasterBofModel = require("../models-bof/product-master-bof-model");

const OrderDetailCusModel = sequelize.define(
  "OrderDetailCus",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: OrderCusModel,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductMasterBofModel,
        key: "id",
      },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "order_detail",
    timestamps: false,
  }
);

OrderCusModel.hasMany(OrderDetailCusModel, {
  foreignKey: "order_id",
  as: "order_details",
});

module.exports = OrderDetailCusModel;
