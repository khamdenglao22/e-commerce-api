const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const ProductColorModel = sequelize.define(
  "product_color",
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
    color_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_color",
    timestamps: false,
  }
);

module.exports = ProductColorModel;
