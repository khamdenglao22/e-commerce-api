const sequelize = require("../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("./models-cus/customer-cus-model");
const AddressCusModel = require("./models-cus/address-cus-model");

const OrderModel = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "success",
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CustomerCusModel, // Assuming you have a customers table
        key: "id",
      },
    },

    shipping_address: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AddressCusModel, // Assuming you have an address table
        key: "id",
      },
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

OrderModel.belongsTo(CustomerCusModel, {
  foreignKey: "customer_id",
  as: "customer",
});

OrderModel.belongsTo(AddressCusModel, {
  foreignKey: "shipping_address",
  as: "address",
});

module.exports = OrderModel;
