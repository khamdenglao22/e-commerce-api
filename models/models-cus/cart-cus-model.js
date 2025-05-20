const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("./customer-cus-model");
const ProductModel = require("../models-seller/product-model");

const CartCusModel = sequelize.define(
  "CartCus",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    qty: {
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductModel,
        key: "id",
      },
    },
  },
  {
    tableName: "cart",
    timestamps: false,
  }
);

// CartCusModel.belongsTo(CustomerCusModel, {
//   foreignKey: "customer_id",
//   as: "customer",
// });

CartCusModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});

module.exports = CartCusModel;
