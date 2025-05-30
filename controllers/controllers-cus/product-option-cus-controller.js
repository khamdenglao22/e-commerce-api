const { Op } = require("sequelize");
const ProductOptionModel = require("../../models/models-bof/product-option-model");
const { HTTP_NOT_FOUND, HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.findAllProductOptionsByProductId = async (req, res) => {
  try {
    const { product_id, option_type } = req.params;
    const productOptions = await ProductOptionModel.findAll({
      where: {
        [Op.and]: [{ option_id: product_id }, { option_type: option_type }],
      },
      order: [["id", "ASC"]],
    });
    if (!productOptions || productOptions.length === 0) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "No product options found for this product",
      });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: productOptions,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
