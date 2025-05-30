const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const CategoryBofModel = require("./category-bof-model");

const ProductSizeModel = sequelize.define(
  "product_size",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CategoryBofModel,
        key: "id",
      },
    },
  },
  {
    tableName: "product_size",
    timestamps: false,
  }
);
ProductSizeModel.belongsTo(CategoryBofModel, {
  foreignKey: "category_id",
  as: "category",
});

module.exports = ProductSizeModel;
