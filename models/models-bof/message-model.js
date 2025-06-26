const sequelize = require("../../config");
const { DataTypes } = require("sequelize");
const ConversationModel = require("./conversation-model");

const MessageModel = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ConversationModel,
        key: "id",
      },
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("text", "image", "file"),
      defaultValue: "text",
    },
    messageRole: {
      type: DataTypes.ENUM(
        "adminAndSeller",
        "adminAndCustomer",
        "sellerAndCustomer"
      ),
      defaultValue: "adminAndSeller",
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    tableName: "message",
    timestamps: true,
  }
);

module.exports = MessageModel;
