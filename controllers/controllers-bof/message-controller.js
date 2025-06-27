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

exports.findAllMessageByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.query;
    let result = await MessageModel.findAll({
      order: [["id", "ASC"]],
      where: {
        conversationId: conversationId,
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

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      delete req.body.image;
    }
    const { error } = brandSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    let result = await MessageModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Brand not found",
      });
    }

    if (req.files && req.files.image) {
      // Upload new image
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return next({
          status: 400,
          msg: "ຮູບຫ້ອງຄ້າຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(path.join(__dirname, `../../uploads/images/brands/${filename}`));
      req.body.image = filename;
    }

    if (result.name_en !== req.body.name_en) {
      const checkExist = await MessageModel.findOne({
        where: { name_en: req.body.name_en },
      });

      if (checkExist) {
        return res.status(HTTP_BAD_REQUEST).json({
          status: HTTP_BAD_REQUEST,
          msg: "Brand already exists",
        });
      }
    }

    // start transaction
    await sequelize.transaction(async (t) => {
      // update brand
      await MessageModel.update(req.body, {
        where: { id },
        transaction: t,
      });

      if (req.files && req.files.image) {
        if (result.image) {
          // Delete old image
          const oldFilePath = path.join(
            __dirname,
            "../../uploads/images/brands",
            result.image
          );

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }
      res.status(HTTP_SUCCESS).json({
        status: HTTP_SUCCESS,
        msg: "Brand updated successfully",
      });
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msgM: error.message,
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await MessageModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Brand not found",
      });
    }

    // Delete brand
    await MessageModel.destroy({
      where: { id },
    });

    if (result.image) {
      // Delete image
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/images/brand",
        result.image
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
