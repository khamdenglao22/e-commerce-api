const sequelize = require('../../config');
const { DataTypes } = require('sequelize');

const RoleBofModel = sequelize.define(
  'role',
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
  },
  {
    tableName: 'roles',
    timestamps: false,
  }
);

module.exports = RoleBofModel;