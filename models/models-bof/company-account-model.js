const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const CompanyAccountModel = sequelize.define(
  "company_account",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    account: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "company_account",
    timestamps: true,
  }
);

module.exports = CompanyAccountModel;
