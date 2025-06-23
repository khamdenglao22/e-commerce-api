const BrandBofModel = require("../../models/models-bof/brand-bof-model");
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
const SlideImageModel = require("../../models/models-bof/slide-image-model");

exports.findAllImage = async (req, res) => {
  try {
    let result = await SlideImageModel.findAll({
      order: [["createdAt", "DESC"]],
    });
    result = result.map((row) => {
      if (row.image) {
        row.dataValues.image = `${BRAND_MEDIA_URL}/${row.image}`;
      } else {
        row.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
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

exports.findImageById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await SlideImageModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Image not found",
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

exports.createImage = async (req, res) => {
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
      req.body.image = filename;
    }

    const newBrand = await SlideImageModel.create(req.body);

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: newBrand,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await SlideImageModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Image not found",
      });
    }

    // Delete brand
    await SlideImageModel.destroy({
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
      msg: "Image deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
