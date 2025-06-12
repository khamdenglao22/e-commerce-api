const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMasterBofModel = require("./product-master-bof-model");

const ProductColorOptionModel = sequelize.define(
  "product_color_option",
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
    color_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_color_options",
    timestamps: false,
  }
);
// Define associations
ProductMasterBofModel.hasMany(ProductColorOptionModel, {
  foreignKey: "product_id",
  as: "colorOptions",
});

module.exports = ProductColorOptionModel;
