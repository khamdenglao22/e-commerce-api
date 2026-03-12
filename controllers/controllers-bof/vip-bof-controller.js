const e = require("express");
const VipModel = require("../../models/models-cus/vip-model");
const { SELLER_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const ShopOverviewModel = require("../../models/models-seller/shop-overview-model");

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

    let overview_value = 0;

    console.log(existingVip.dataValues.vip_level);

    if (existingVip.dataValues.vip_level === "1") {
      overview_value = 5;
    } else if (existingVip.dataValues.vip_level === "2") {
      overview_value = 10;
    } else if (existingVip.dataValues.vip_level === "3") {
      overview_value = 15;
    }

    const overview = await ShopOverviewModel.findOne({
      where: {
        seller_id: seller_id,
        overview_type: "credit",
        overview_status: "vip",
      },
    });

    if (overview) {
      await ShopOverviewModel.update(
        {
          overview_value: overview_value,
        },
        {
          where: {
            seller_id: seller_id,
            overview_type: "credit",
            overview_status: "vip",
          },
        },
      );
    } else {
      await ShopOverviewModel.create({
        seller_id: seller_id,
        overview_value: overview_value,
        overview_type: "credit",
        overview_status: "vip",
      });
    }

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
