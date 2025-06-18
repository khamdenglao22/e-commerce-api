const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CustomerCusModel = require("./customer-cus-model");

const DepositCusModel = sequelize.define(
  "DepositCusModel",
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
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "deposit_customer",
    timestamps: true,
  }
);

DepositCusModel.belongsTo(CustomerCusModel, {
  foreignKey: "customer_id",
  as: "customer",
});

CustomerCusModel.hasMany(DepositCusModel, {
  foreignKey: "customer_id",
  as: "deposit_customer",
});

module.exports = DepositCusModel;
