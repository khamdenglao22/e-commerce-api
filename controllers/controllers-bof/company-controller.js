const { Op } = require("sequelize");
const CompanyModel = require("../../models/models-bof/company-model");
const CompanyAccountModel = require("../../models/models-bof/company-account-model");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const path = require("path");
const fs = require("fs");

exports.findAll = async (req, res) => {
  try {
    await CompanyModel.findAll()
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

exports.findById = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await CompanyModel.findByPk(id);
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
exports.create = async (req, res) => {
  try {
    // Check if the role already exists
    await CompanyModel.create(req.body)
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

exports.update = async (req, res) => {
  const { id } = req.params;
  let result = await CompanyModel.findByPk(id);
  if (!result) {
    return res.status(HTTP_NOT_FOUND).json({
      status: HTTP_NOT_FOUND,
      msg: "Role not found",
    });
  }
  await CompanyModel.update(req.body, { where: { id: id } })
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

exports.deleteById = async (req, res) => {
  const { id } = req.params;
  let result = await CompanyModel.findByPk(id);
  if (!result) {
    return res.status(HTTP_NOT_FOUND).json({
      status: HTTP_NOT_FOUND,
      msg: "Role not found",
    });
  }
  await CompanyModel.destroy({ where: { id } })
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

exports.findAllAccount = async (req, res) => {
  try {
    await CompanyAccountModel.findAll()
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

exports.createAccount = async (req, res) => {
  try {
    // Check if the role already exists
    const existingProduct = await CompanyAccountModel.findOne({
      where: {
        [Op.or]: [{ account: req.body.account }],
      },
    });
    if (existingProduct) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Account already exists",
      });
    }
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
      req.body.image = filename;
    }
    await CompanyAccountModel.create(req.body)
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

exports.deleteAccountById = async (req, res) => {
  const { id } = req.params;
  let result = await CompanyAccountModel.findByPk(id);
  if (!result) {
    return res.status(HTTP_NOT_FOUND).json({
      status: HTTP_NOT_FOUND,
      msg: "Account not found",
    });
  }
  await CompanyAccountModel.destroy({ where: { id } })
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
