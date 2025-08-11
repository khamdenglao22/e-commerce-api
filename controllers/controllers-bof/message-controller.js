// const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const MessageModel = require("../../models/models-bof/message-model");
const ConversationModel = require("../../models/models-bof/conversation-model");
const UserBofModel = require("../../models/models-bof/user-bof-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const SellerModel = require("../../models/models-seller/seller-model");
const { BASE_MEDIA_URL, BRAND_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
  HTTP_CREATED,
} = require("../../utils/http_status");
const path = require("path");
const fs = require("fs");
const sequelize = require("../../config");
const { brandSchema } = require("../../schemas/brand-schemas");
const { Op, Model, Sequelize } = require("sequelize");

exports.createConversation = async (req, res) => {
  try {
    let { users } = req.body;

    if (!Array.isArray(users) || users.length < 2) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Invalid users array (must contain at least 2 users)",
      });
    }

    // Sort users to normalize key
    const sortedUsers = [...users].sort((a, b) => a - b);
    const userKey = sortedUsers.join("-"); // e.g., "1-3"

    // Check if conversation already exists
    const existing = await ConversationModel.findOne({ where: { userKey } });

    if (existing) {
      return res.status(200).json({
        status: 200,
        message: "Conversation already exists",
        data: existing,
      });
    }

    // Create new conversation
    const result = await ConversationModel.create({
      users: sortedUsers,
      userKey,
    });

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.getConversationsByUserId = async (req, res) => {
  try {
    const { userId, type, role } = req.query;
    // const { type, role } = req.params;
    const parsedUserId = parseInt(userId);

    if (!parsedUserId || !type || !role) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "userId, type, and role are required.",
      });
    }

    // Filter conversations that match the conversation role and contain userId
    const conversations = await ConversationModel.findAll({
      where: {
        role: role, // role is now the column name in DB (adminAndSeller, etc.)
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "JSON_CONTAINS",
              sequelize.col("users"),
              JSON.stringify([parsedUserId])
            ),
            1
          ),
        ],
      },
    });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const usersArray = Array.isArray(conv.users)
          ? conv.users
          : JSON.parse(conv.users);

        const otherUserId = usersArray.find((id) => id !== parsedUserId);

        let otherUser = null;

        // Based on conversation role and current user's type
        switch (role) {
          case "adminAndSeller":
            if (type === "admin") {
              otherUser = await SellerModel.findOne({
                where: { id: otherUserId },
              });
            } else {
              otherUser = await UserBofModel.findOne({
                where: { id: otherUserId },
              });
            }
            break;

          case "adminAndCustomer":
            if (type === "admin") {
              otherUser = await CustomerCusModel.findOne({
                where: { id: otherUserId },
              });
            } else {
              otherUser = await UserBofModel.findOne({
                where: { id: otherUserId },
              });
            }
            break;

          case "sellerAndCustomer":
            if (type === "seller") {
              otherUser = await CustomerCusModel.findOne({
                where: { id: otherUserId },
              });
            } else {
              otherUser = await SellerModel.findOne({
                where: { id: otherUserId },
              });
            }
            break;

          default:
            break;
        }

        return {
          ...conv.toJSON(),
          otherUser,
        };
      })
    );

    res.status(200).json({
      status: 200,
      data: enrichedConversations,
    });
  } catch (error) {
    console.error("Conversation Fetch Error:", error);
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createMessage = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return res.json({
          status: 400,
          msg: "ຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(path.join(__dirname, `../../uploads/images/brands/${filename}`));
      req.body.file = filename;
      req.body.messageType = "image";
    }
    const result = await MessageModel.create(req.body);
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAllMessageBetweenUsers = async (req, res) => {
  try {
    const { user1, user2, role } = req.params;
    let result = await MessageModel.findAll({
      order: [["id", "DESC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { sender_id: user1, receiver_id: user2 },
              { sender_id: user2, receiver_id: user1 },
            ],
          },
          role ? { messageRole: role } : {},
        ],
      },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAllMessageUnReadByUserId = async (req, res) => {
  try {
    const { userId, role } = req.params;
    let result = await MessageModel.findAll({
      order: [["id", "ASC"]],
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ receiver_id: userId }],
          },
          { isRead: false },
          role ? { messageRole: role } : {},
        ],
      },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAllMessageByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.query;
    let result = await MessageModel.findAll({
      order: [["id", "ASC"]],
      where: {
        conversationId: conversationId,
      },
    });
    result = result.map((row) => {
      if (row.file) {
        row.dataValues.file = `${BRAND_MEDIA_URL}/${row.file}`;
      } else {
        row.dataValues.file = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return row;
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await MessageModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Brand not found",
      });
    }
    if (result.image) {
      result.dataValues.image = `${BRAND_MEDIA_URL}/${result.image}`;
    } else {
      result.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.updateMessagesReadByConversationIdAndReceiverId = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { receiver_id } = req.query;

    if (!conversationId) {
      return res.status(400).json({
        status: 400,
        msg: "Missing conversationId",
      });
    }

    const [updatedCount] = await MessageModel.update(
      { isRead: true },
      {
        where: {
          conversationId: conversationId,
          receiver_id: receiver_id,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      status: 200,
      msg: `Updated ${updatedCount} message(s) as read`,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      msg: error.message,
    });
  }
};
exports.deleteMessageByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Find messages by conversationId
    const messages = await MessageModel.findAll({
      where: { conversationId },
    });

    if (!messages.length) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "No messages found for this conversation",
      });
    }

    // If your messages can contain files, delete them
    for (const msg of messages) {
      if (msg.file) {
        const oldFilePath = path.join(
          __dirname,
          "../../uploads/images/brand", // adjust path if needed
          msg.file
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Delete messages from DB
    await MessageModel.destroy({
      where: { conversationId },
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Messages deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
