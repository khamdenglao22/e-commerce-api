const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const CategoryBofModel = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_th: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_ch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "category",
    timestamps: true,
  }
);

module.exports = CategoryBofModel;