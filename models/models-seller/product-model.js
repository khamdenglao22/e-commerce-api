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
        model: "product_master",
        key: "id",
      },
    },
    product_status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "active",
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sellers",
        key: "id",
      },
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

SellerModel.hasMany(ProductModel, {
  foreignKey: "seller_id",
  as: "products",
});

module.exports = ProductModel;
