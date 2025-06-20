const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const SellerModel = require("./seller-model");

const WithdrawSellerModel = sequelize.define(
  "WithdrawSellerModel",
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
    withdraw_status: {
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
    
  },
  {
    tableName: "withdraw_seller",
    timestamps: true,
  }
);

WithdrawSellerModel.belongsTo(SellerModel, {
  foreignKey: "seller_id",
  as: "seller",
});


SellerModel.hasMany(WithdrawSellerModel, {
  foreignKey: "seller_id",
  as: "withdraw_seller",
});

module.exports = WithdrawSellerModel;
