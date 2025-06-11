const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("../models-cus/customer-cus-model");

const SellerModel = sequelize.define(
  "Seller",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    store_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    front_document: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    back_certificate: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    contact_person: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    invitation_code: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CustomerCusModel,
        key: "id",
      },
    },
    seller_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",//"active","block"
    },
  },
  {
    tableName: "sellers",
    timestamps: true,
  }
);

module.exports = SellerModel;
