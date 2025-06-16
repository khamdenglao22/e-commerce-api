const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CategoryBofModel = require("./category-bof-model");
const BrandBofModel = require("./brand-bof-model");

const ProductMasterBofModel = sequelize.define(
  "ProductMasterBofModel",
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
    description_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_th: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_ch: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    long_description_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    long_description_th: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    long_description_ch: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { model: CategoryBofModel, key: "id" },
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { model: BrandBofModel, key: "id" },
    },
    p_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "product_master",
    timestamps: true,
  }
);
ProductMasterBofModel.belongsTo(CategoryBofModel, {
  foreignKey: "category_id",
  as: "category",
});
ProductMasterBofModel.belongsTo(BrandBofModel, {
  foreignKey: "brand_id",
  as: "brand",
});

module.exports = ProductMasterBofModel;
