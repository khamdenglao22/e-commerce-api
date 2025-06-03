const { Op } = require("sequelize");
const ProductSizeModel = require("../../models/models-bof/product-size-model");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
} = require("../../utils/http_status");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");

exports.findAllProductSizes = async (req, res) => {
  try {
    const productSizes = await ProductSizeModel.findAll({
      order: [["id", "ASC"]],
      include: [
        {
          model: CategoryBofModel,
          as: "category",
          attributes: ["id", "name_en", "name_th", "name_ch"],
        },
      ],
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productSizes,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findProductSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const productSize = await ProductSizeModel.findByPk(id);
    if (!productSize) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product size not found",
      });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productSize,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createProductSize = async (req, res) => {
  try {
    const existingSize = await ProductSizeModel.findOne({
      where: {
        [Op.and]: [
          { product_size: req.body.product_size },
          { category_id: req.body.category_id },
        ],
      },
    });
    if (existingSize) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Size already exists",
      });
    }
    await ProductSizeModel.create(req.body);
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "created successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.updateProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const existingSize = await ProductSizeModel.findByPk(id);
    if (!existingSize) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product size not found",
      });
    }
    await ProductSizeModel.update(req.body, { where: { id } });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product size updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAllProductSizesByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const productSizes = await ProductSizeModel.findAll({
      where: { category_id },
      order: [["id", "ASC"]],
    });
    
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productSizes,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
