const sequelize = require("../../config");
const { DataTypes } = require("sequelize");

const ConversationModel = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    users: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    userKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("adminAndSeller", "adminAndCustomer", "sellerAndCustomer"),
      defaultValue: "adminAndSeller",
      allowNull: true,
    },
  },
  {
    tableName: "conversation",
    timestamps: true,
  }
);

module.exports = ConversationModel;
