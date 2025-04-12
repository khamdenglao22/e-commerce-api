const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const RoleBofModel = require("./role-bof-model");

const UserBofModel = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: RoleBofModel, key: "id" },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

UserBofModel.belongsTo(RoleBofModel, {
  foreignKey: "role_id",
  as: "role",
});

module.exports = UserBofModel;
