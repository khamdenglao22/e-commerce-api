const { Sequelize } = require("sequelize");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const { categorySchema } = require("../../schemas/category-schemas");
const {
  PRODUCT_MEDIA_URL,
  CATEGORY_MEDIA_URL,
  BASE_MEDIA_URL,
} = require("../../utils/constant");
const {
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_CREATED,
} = require("../../utils/http_status");
const fs = require("fs");
const path = require("path");

exports.findAllCategory = async (req, res) => {
  try {
    let result = await CategoryBofModel.findAll({
      order: [
        [
          Sequelize.literal(
            "CASE WHEN name_en = 'not category' THEN 0 ELSE 1 END"
          ),
          "ASC",
        ],
        ["name_en", "ASC"],
      ],
    });
    result = result.map((row) => {
      if (row.image) {
        row.dataValues.image = `${CATEGORY_MEDIA_URL}/${row.image}`;
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

exports.findCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await CategoryBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Category not found",
      });
    }
    if (result.image) {
      result.dataValues.image = `${CATEGORY_MEDIA_URL}/${result.image}`;
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

exports.createCategory = async (req, res) => {
  try {
    if (!req.files) {
      delete req.body.image;
    }
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }

    if (req.files && req.files.image) {
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
      image.mv(
        path.join(__dirname, `../../uploads/images/categories/${filename}`)
      );
      req.body.image = filename;
    }

    const result = await CategoryBofModel.create(req.body);

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

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files) {
      delete req.body.image;
    }
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    let result = await CategoryBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Category not found",
      });
    }
    if (req.files && req.files.image) {
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
      image.mv(
        path.join(__dirname, `../../uploads/images/categories/${filename}`)
      );
      req.body.image = filename;

      if (result.image) {
        // Delete old image file if it exists
        const oldFilePath = path.join(
          __dirname,
          "../../uploads/images/categories",
          result.image
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    await CategoryBofModel.update(req.body, {
      where: { id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Category updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await CategoryBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Category not found",
      });
    }

    // Delete image file if it exists
    if (result.image) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/images/categories",
        result.image
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await CategoryBofModel.destroy({
      where: { id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Category deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
