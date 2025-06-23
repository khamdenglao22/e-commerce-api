const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const { post } = require("../../routers/routers-cus/cart-cus-router");
const CustomerCusModel = require("./customer-cus-model");

const AddressCusModel = sequelize.define(
  "AddressCus",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    contact_person: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "address_customer",
    timestamps: false,
  }
);

AddressCusModel.belongsTo(CustomerCusModel, {
  foreignKey: "customer_id",
  as: "customer",
});

module.exports = AddressCusModel;
