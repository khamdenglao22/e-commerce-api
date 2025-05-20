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

exports.findAllBrand = async (req, res) => {
  try {
    let result = await BrandBofModel.findAll({
      order: [["id", "DESC"]],
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

exports.findBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await BrandBofModel.findByPk(id);
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

exports.createBrand = async (req, res) => {
  try {
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

    if (req.files && req.files.image) {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg"];
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

    const newBrand = await BrandBofModel.create(req.body);

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
    let result = await BrandBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Brand not found",
      });
    }

    if (req.files && req.files.image) {
      // Upload new image
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg"];
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

    // start transaction
    await sequelize.transaction(async (t) => {
      // update brand
      await BrandBofModel.update(req.body, {
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
    // end transaction

    // const updatedBrand = await BrandBofModel.update(req.body, {
    //   where: { id },
    // });
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
    let result = await BrandBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Brand not found",
      });
    }

    // Delete brand
    await BrandBofModel.destroy({
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
