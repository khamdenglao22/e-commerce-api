const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMasterBofModel = require("./product-master-bof-model");

const ProductOptionModel = sequelize.define(
  "ProductOption",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductMasterBofModel,
        key: "id",
      },
    },
    option_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    option_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_options",
    timestamps: false,
  }
);

module.exports = ProductOptionModel;
