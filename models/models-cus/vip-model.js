const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const VipModel = sequelize.define(
  "VipModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vip_level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "seller_vip",
    timestamps: true,
  },
);

module.exports = VipModel;
