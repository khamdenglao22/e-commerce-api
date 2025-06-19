const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("./customer-cus-model");
const ProductModel = require("../models-seller/product-model");
const ProductSizeOptionModel = require("../models-bof/product-size-option-model");
const ProductColorOptionModel = require("../models-bof/product-color-option-model");

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

    product_size_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    product_color_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    cart_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cart",
    timestamps: false,
  }
);

CartCusModel.belongsTo(ProductSizeOptionModel, {
  foreignKey: "product_size_id",
  as: "productSize",
});
CartCusModel.belongsTo(ProductColorOptionModel, {
  foreignKey: "product_color_id",
  as: "productColor",
});

// CartCusModel.belongsTo(CustomerCusModel, {
//   foreignKey: "customer_id",
//   as: "customer",
// });

CartCusModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});

module.exports = CartCusModel;
