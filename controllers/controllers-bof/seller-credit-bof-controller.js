const ShopOverviewModel = require("../../models/models-seller/shop-overview-model");
const { HTTP_BAD_REQUEST, HTTP_SUCCESS } = require("../../utils/http_status");

exports.updateCredit = async (req, res) => {
  const { id } = req.params;
  try {
    await ShopOverviewModel.create({
      seller_id: id,
      overview_value: req.body.credit,
      overview_type: req.body.overview_type,
      overview_status: req.body.overview_status,
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "update successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
