const ProductOptionModel = require("../../models/models-bof/product-option-model");
const { HTTP_CREATED } = require("../../utils/http_status");

exports.createProductOption = async (req, res) => {
  try {
    const { product_id, option_value, option_type } = req.body;

    const productOption = await ProductOptionModel.bulkCreate(
      option_value.map((val) => ({
        product_id,
        option_type: option_type,
        option_id: val,
      }))
    );
    if (!productOption) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Failed to create product option",
      });
    }
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "Product option created successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
