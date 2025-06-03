const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductColorModel = require("./product-color-model");
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
    product_color_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductColorModel,
        key: "id",
      },
    },
  },
  {
    tableName: "product_color_options",
    timestamps: false,
  }
);
// Define associations
// ProductMasterBofModel.hasMany(ProductColorOptionModel, {
//   foreignKey: "product_id",
//   as: "colorOptions",
// });

// ProductColorOptionModel.belongsTo(ProductColorModel, {
//   foreignKey: "product_color_id",
//   as: "colors",
// });

module.exports = ProductColorOptionModel;
