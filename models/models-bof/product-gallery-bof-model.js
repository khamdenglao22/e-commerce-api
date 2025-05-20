const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ProductMaterBofModel = require("./product-master-bof-model");

const ProductGalleryBofModel = sequelize.define(
  "ProductGallery",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ProductMaterBofModel, key: "id" },
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "product_gallery",
    timestamps: true,
  }
);

ProductMaterBofModel.hasMany(ProductGalleryBofModel, {
  foreignKey: "product_id",
  as: "product_gallery",
});

module.exports = ProductGalleryBofModel;
