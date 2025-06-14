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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: CategoryBofModel, key: "id" },
    },
  },
  {
    tableName: "brands",
    timestamps: true,
  }
);

BrandBofModel.belongsTo(CategoryBofModel, {
  foreignKey: "category_id",
  as: "category",
});

module.exports = BrandBofModel;
