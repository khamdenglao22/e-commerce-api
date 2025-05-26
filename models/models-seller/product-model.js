const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMasterBofModel = require("../models-bof/product-master-bof-model");
const SellerModel = require("./seller-model");

const ProductModel = sequelize.define(
  "ProductModel",
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
        as: "id",
      },
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      model: SellerModel,
      as: "id",
    },
  },
  {
    tableName: "product",
    timestamps: false,
  }
);

ProductModel.belongsTo(ProductMasterBofModel, {
  foreignKey: "product_id",
  as: "product_master",
});

ProductModel.belongsTo(SellerModel, {
  foreignKey: "seller_id",
  as: "seller",
});

module.exports = ProductModel;
