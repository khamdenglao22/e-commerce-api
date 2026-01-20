const VipModel = require("../../models/models-cus/vip-model");
const { SELLER_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");

exports.findBySellerId = async (req, res) => {
  try {
    const { id } = req.params;
    const vip = await VipModel.findOne({
      where: {
        seller_id: id,
      },
    });
    if (!vip) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "VIP not found for this seller",
      });
    }

    if (vip.image) {
      vip.dataValues.image = `${SELLER_MEDIA_URL}/${vip.image}`;
    } else {
      vip.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
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
