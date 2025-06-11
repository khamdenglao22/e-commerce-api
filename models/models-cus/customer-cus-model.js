const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const CustomerCusModel = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "active", //"block",
    },
  },
  {
    tableName: "customers",
    timestamps: true,
  }
);

module.exports = CustomerCusModel;
