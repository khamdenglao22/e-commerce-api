const bcrypt = require("bcryptjs");
const UserBofModel = require("../../models/models-bof/user-bot-model");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const {
  userChangePasswordSchema,
  userUpdateSchema,
  userCreateSchema,
} = require("../../schemas/user-schemas");
const { Op } = require("sequelize");

function passwordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

exports.findAllUser = async (req, res) => {
  try {
    let result = await UserBofModel.findAll({
      attributes: { exclude: ["password"] },
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

exports.findUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await UserBofModel.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "User not found",
      });
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

exports.createUser = async (req, res) => {
  try {
    const { error } = userCreateSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    req.body.password = req.body.password.trim();
    req.body.username = req.body.username.trim();

    // check exiting
    const existingUser = await UserBofModel.findOne({
      where: {
        [Op.or]: [{ username: req.body.username }],
      },
    });
    if (existingUser) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Username already exists",
      });
    }
    // hash password
    req.body.password = passwordHash(req.body.password);
    let result = await UserBofModel.create(req.body);
    delete result.dataValues.password;
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

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = userUpdateSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    let result = await UserBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "User not found",
      });
    }
    await UserBofModel.update(req.body, {
      where: { id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "User updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await UserBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "User not found",
      });
    }
    await UserBofModel.destroy({
      where: { id },
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "User deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = userChangePasswordSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    let result = await UserBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "User not found",
      });
    }
    req.body.password = passwordHash(req.body.password);
    await UserBofModel.update(req.body, {
      where: { id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Password updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await UserBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "User not found",
      });
    }
    await UserBofModel.update(
      { status: !result.status },
      {
        where: { id },
      }
    );
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Status updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
