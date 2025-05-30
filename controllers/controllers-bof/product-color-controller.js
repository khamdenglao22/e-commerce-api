const ProductColorModel = require("../../models/models-bof/product-color-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.findAllProductColor = async (req, res) => {
  try {
    const productColor = await ProductColorModel.findAll({
      order: [["id", "ASC"]],
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productColor,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findProductColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const productColor = await ProductColorModel.findByPk(id);
    if (!productColor) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product color not found",
      });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productColor,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createProductColor = async (req, res) => {
  try {
    const existingColor = await ProductColorModel.findOne({
      where: {
        name_en: req.body.name_en,
      },
    });
    if (existingColor) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product color already exists",
      });
    }
    await ProductColorModel.create(req.body);
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product color created successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.updateProductColor = async (req, res) => {
  try {
    const { id } = req.params;
    const existingColor = await ProductColorModel.findByPk(id);
    if (!existingColor) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product color not found",
      });
    }
    await ProductColorModel.update(req.body, {
      where: { id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product color updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
