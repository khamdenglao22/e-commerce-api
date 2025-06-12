const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMasterBofModel = require("./product-master-bof-model");

const ProductSizeOptionModel = sequelize.define(
  "ProductSizeOption",
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
    product_size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_size_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "product_size_options",
    timestamps: false,
  }
);

// Define associations
ProductMasterBofModel.hasMany(ProductSizeOptionModel, {
  foreignKey: "product_id",
  as: "sizeOptions",
});

module.exports = ProductSizeOptionModel;
