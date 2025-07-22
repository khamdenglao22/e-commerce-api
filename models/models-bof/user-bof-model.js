const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const SellerModel = require("../models-seller/seller-model");
const RoleBofModel = require("./role-bof-model");

const UserBofModel = sequelize.define(
  "users",
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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: SellerModel, key: "id" },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = UserBofModel;
