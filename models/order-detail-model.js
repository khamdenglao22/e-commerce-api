const sequelize = require("../config");
const { DataTypes } = require("sequelize");
const OrderModel = require("./order-model");
const ProductModel = require("./models-seller/product-model");
const ProductColorOptionModel = require("./models-bof/product-color-option-model");
const ProductSizeOptionModel = require("./models-bof/product-size-option-model");

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
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    order_detail_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "success",
    },
  },
  {
    tableName: "order_details",
    timestamps: false,
  }
);

OrderModel.hasMany(OrderDetailModel, {
  foreignKey: "order_id",
  as: "order_details",
});

OrderDetailModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product_details",
});

OrderDetailModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});

OrderDetailModel.belongsTo(ProductColorOptionModel, {
  foreignKey: "product_color_id",
  as: "product_color_details",
});

OrderDetailModel.belongsTo(ProductSizeOptionModel, {
  foreignKey: "product_size_id",
  as: "product_size_details",
});

module.exports = OrderDetailModel;
