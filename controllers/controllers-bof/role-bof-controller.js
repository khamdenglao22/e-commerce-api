const RoleBofModel = require("../../models/models-bof/role-bof-model");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");

exports.findAllRoles = async (req, res) => {
  try {
    await RoleBofModel.findAll()
      .then((response) => {
        res.status(HTTP_SUCCESS).json({
          status: HTTP_SUCCESS,
          data: response,
        });
      })
      .catch((err) => {
        res
          .status(HTTP_BAD_REQUEST)
          .json({ status: HTTP_BAD_REQUEST, msg: err.message });
      });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.findRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await RoleBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Role not found",
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
exports.createRole = async (req, res) => {
  try {
    // Check if the role already exists
    const existingProduct = await RoleBofModel.findOne({
      where: {
        [Op.or]: [
          { name_en: req.body.name_en },
          { name_th: req.body.name_th },
          { name_ch: req.body.name_ch },
        ],
      },
    });
    if (existingProduct) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Role already exists",
      });
    }
    await RoleBofModel.create(req.body)
      .then((response) => {
        res.status(HTTP_SUCCESS).json({
          status: HTTP_SUCCESS,
          data: response,
        });
      })
      .catch((err) => {
        res
          .status(HTTP_BAD_REQUEST)
          .json({ status: HTTP_BAD_REQUEST, msg: err.message });
      });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  let result = await RoleBofModel.findByPk(id);
  if (!result) {
    return res.status(HTTP_NOT_FOUND).json({
      status: HTTP_NOT_FOUND,
      msg: "Role not found",
    });
  }
  await RoleBofModel.update(req.body, { where: { id: id } })
    .then((response) => {
      res.status(HTTP_SUCCESS).json({
        status: HTTP_SUCCESS,
        msg: "Role updated successfully",
      });
    })
    .catch((err) => {
      res
        .status(HTTP_BAD_REQUEST)
        .json({ status: HTTP_BAD_REQUEST, msg: err.message });
    });
};

exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  let result = await RoleBofModel.findByPk(id);
  if (!result) {
    return res.status(HTTP_NOT_FOUND).json({
      status: HTTP_NOT_FOUND,
      msg: "Role not found",
    });
  }
  await RoleBofModel.destroy({ where: { id } })
    .then((response) => {
      res.status(HTTP_SUCCESS).json({
        status: HTTP_SUCCESS,
        data: response,
      });
    })
    .catch((err) => {
      res
        .status(HTTP_BAD_REQUEST)
        .json({ status: HTTP_BAD_REQUEST, msg: err.message });
    });
};
