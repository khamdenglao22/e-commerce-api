const e = require("express");
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
    let vip = await VipModel.findAll({
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

    vip = vip.map((row) => {
      if (row.image) {
        row.dataValues.image = `${SELLER_MEDIA_URL}/${row.image}`;
      } else {
        row.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return row;
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      vip,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.confirmUpgradeVip = async (req, res) => {
  try {
    const { id } = req.params;
    const { seller_id } = req.query;

    const existingVip = await VipModel.findOne({
      where: {
        id: id,
      },
    });
    if (!existingVip) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "VIP not found",
      });
    }

    await VipModel.update(
      { status: "unactive" },
      { where: { seller_id: seller_id } },
    );

    await VipModel.update({ status: "active" }, { where: { id: id } });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Upgrade vip successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
