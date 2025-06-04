const { Op } = require("sequelize");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const { productSchema } = require("../../schemas/product-schemas");
const path = require("path");
const fs = require("fs");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const sequelize = require("../../config");
const ProductSizeModel = require("../../models/models-bof/product-size-model");
const e = require("express");
const ProductColorModel = require("../../models/models-bof/product-color-model");

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  //   console.log("+size", +size, "offset", offset);
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.findAllProduct = async (req, res) => {
  const { page, size, p_name, category_id, brand_id } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  if (p_name) {
    filter = {
      [Op.or]: [
        { name_en: { [Op.like]: `%${p_name}%` } },
        { name_th: { [Op.like]: `%${p_name}%` } },
        { name_ch: { [Op.like]: `%${p_name}%` } },
      ],
    };
  }
  // console.log("filter", filter);

  if (category_id && !brand_id) {
    filter = {
      [Op.or]: [{ category_id: category_id }],
    };
  } else if (!category_id && brand_id) {
    filter = {
      [Op.and]: [{ brand_id: brand_id }],
    };
  } else if (category_id && brand_id) {
    filter = {
      [Op.and]: [{ category_id: category_id }, { brand_id: brand_id }],
    };
  }

  // console.log("filter", filter);

  try {
    await ProductMasterBofModel.findAndCountAll({
      order: [["id", "DESC"]],
      where: { ...filter },
      limit,
      offset,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: BrandBofModel,
          as: "brand",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: CategoryBofModel,
          as: "category",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: ProductSizeOptionModel,
          as: "sizeOptions",
          attributes: ["id"],
          include: [
            {
              model: ProductSizeModel,
              as: "sizes",
              attributes: { exclude: ["category_id"] },
            },
          ],
        },
        {
          model: ProductColorOptionModel,
          as: "colorOptions",
          attributes: ["id"],
          include: [
            {
              model: ProductColorModel,
              as: "colors",
              attributes: ["id", "color_code"],
            },
          ],
        },
      ],
    })
      .then((data) => {
        const response = getPagingData(data, page, limit);
        response.result = response.result.map((our) => {
          if (our.image) {
            our.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.image}`;
          } else {
            our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
          }
          return our;
        });
        res.json(response);
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

exports.findProductById = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await ProductMasterBofModel.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: ProductSizeOptionModel,
          as: "sizeOptions",
          attributes: { exclude: ["product_id"] },
          include: [
            {
              model: ProductSizeModel,
              as: "sizes",
            },
          ],
        },
        {
          model: ProductColorOptionModel,
          as: "colorOptions",
          attributes: { exclude: ["product_id"] },
        },
      ],
    });
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Product not found",
      });
    }
    if (result.image) {
      result.dataValues.image = `${PRODUCT_MEDIA_URL}/${result.image}`;
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

exports.createProduct = async (req, res) => {
  let { color_options, size_options } = req.body;

  if (typeof color_options === "string") {
    color_options = JSON.parse(color_options);
  }
  if (typeof size_options === "string") {
    size_options = JSON.parse(size_options);
  }

  try {
    if (!req.files) {
      delete req.body.image;
    }
    // const { error } = productSchema.validate(req.body);
    // if (error) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     status: HTTP_BAD_REQUEST,
    //     msg: error.message,
    //   });
    // }
    // Check if product exists
    const existingProduct = await ProductMasterBofModel.findOne({
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
        msg: "Product already exists",
      });
    }

    // Upload image
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
      image.mv(
        path.join(__dirname, `../../uploads/images/products/${filename}`)
      );
      req.body.image = filename;
    }
    const transaction = await sequelize.transaction();

    const result = await ProductMasterBofModel.create(req.body, {
      transaction,
    });

    if (Array.isArray(color_options) && color_options.length > 0) {
      await ProductColorOptionModel.bulkCreate(
        color_options.map((color) => ({
          product_id: result.id,
          product_color_id: color,
        })),
        { transaction }
      );
    }

    if (Array.isArray(size_options) && size_options.length > 0) {
      await ProductSizeOptionModel.bulkCreate(
        size_options.map((size) => ({
          product_id: result.id,
          product_size_id: size,
        })),
        { transaction }
      );
    }

    await transaction.commit();

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

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { color_options, size_options } = req.body;

    if (typeof color_options === "string") {
      color_options = JSON.parse(color_options);
    }
    if (typeof size_options === "string") {
      size_options = JSON.parse(size_options);
    }

    if (!req.files) {
      delete req.body.image;
    }
    // const { error } = productSchema.validate(req.body);
    // if (error) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     status: HTTP_BAD_REQUEST,
    //     msg: error.message,
    //   });
    // }
    let result = await ProductMasterBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Product not found",
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
      image.mv(
        path.join(__dirname, `../../uploads/images/products/${filename}`)
      );
      req.body.image = filename;
      if (result.image) {
        // Delete old image file if it exists
        const oldImagePath = path.join(
          __dirname,
          `../../uploads/images/products/${result.image}`
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const transaction = await sequelize.transaction();

    await ProductMasterBofModel.update(req.body, {
      where: { id: id },
      transaction,
    });

    // Delete existing color options
    await ProductColorOptionModel.destroy({
      where: { product_id: id },
      transaction,
    });
    if (Array.isArray(color_options) && color_options.length > 0) {
      // Create new color options
      await ProductColorOptionModel.bulkCreate(
        color_options.map((color) => ({
          product_id: id,
          product_color_id: color,
        })),
        { transaction }
      );
    }
    // Delete existing size options
    await ProductSizeOptionModel.destroy({
      where: { product_id: id },
      transaction,
    });
    console.log("size_options", size_options);
    if (Array.isArray(size_options) && size_options.length > 0) {
      // Create new size options
      await ProductSizeOptionModel.bulkCreate(
        size_options.map((size) => ({
          product_id: result.id,
          product_size_id: size,
        })),
        { transaction }
      );
    }

    await transaction.commit();

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await ProductMasterBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Product not found",
      });
    }
    if (result.image) {
      // Delete image file if it exists
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/images/products/${result.image}`
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    await ProductMasterBofModel.destroy({
      where: { id: id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
