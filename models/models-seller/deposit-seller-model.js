const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const SellerModel = require("./seller-model");
const CompanyAccountModel = require("../models-bof/company-account-model")

const DepositSellerModel = sequelize.define(
  "DepositSellerModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deposit_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "deposit_seller",
    timestamps: true,
  }
);

DepositSellerModel.belongsTo(SellerModel, {
  foreignKey: "seller_id",
  as: "seller",
});

DepositSellerModel.belongsTo(CompanyAccountModel, {
  foreignKey: "account_id",
  as: "account",
});

SellerModel.hasMany(DepositSellerModel, {
  foreignKey: "seller_id",
  as: "deposit_seller",
});

module.exports = DepositSellerModel;
