const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMasterBofModel = require("./product-master-bof-model");
const ProductSizeModel = require("./product-size-model");

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
    product_size_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductSizeModel,
        key: "id",
      },
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
ProductSizeOptionModel.belongsTo(ProductSizeModel, {
  foreignKey: "product_size_id",
  as: "sizes",
});

module.exports = ProductSizeOptionModel;
