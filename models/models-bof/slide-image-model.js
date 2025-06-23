const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const SlideImageModel = sequelize.define(
  "SlideImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "slide_image",
    timestamps: true,
  }
);

module.exports = SlideImageModel;
