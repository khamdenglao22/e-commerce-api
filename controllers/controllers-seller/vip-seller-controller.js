const VipModel = require("../../models/models-cus/vip-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL, SELLER_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");

exports.findBySellerId = async (req, res) => {
  try {
    const { seller_id } = req.seller;
    const vip = await VipModel.findOne({
      where: {
        seller_id: seller_id,
      },
    });
    if (!vip) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "VIP not found for this seller",
      });
    }

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      vip,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: "error",
    });
  }
};
