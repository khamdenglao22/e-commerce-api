const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CategoryBofModel = require("./category-bof-model");

const BrandBofModel = sequelize.define(
  "Brand",
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
    tableName: "brands",
    timestamps: true,
  }
);

module.exports = BrandBofModel;
