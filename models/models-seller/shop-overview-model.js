const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("../models-cus/customer-cus-model");
const SellerModel = require("./seller-model");

const ShopOverviewModel = sequelize.define(
  "ShopOverviewModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    overview_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    overview_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    overview_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "in",
    },

    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SellerModel,
        key: "id",
      },
    },
  },
  {
    tableName: "shop_overview",
    timestamps: true,
  }
);

module.exports = ShopOverviewModel;
