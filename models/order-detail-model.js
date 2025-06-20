const sequelize = require("../config");
const { DataTypes } = require("sequelize");
const OrderModel = require("./order-model");
const ProductModel = require("./models-seller/product-model");

const OrderDetailModel = sequelize.define(
  "OrderDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: OrderModel,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductModel, // Assuming you have a products table
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
    product_size_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_color_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "order_details",
    timestamps: false,
  }
);

module.exports = OrderDetailModel;
