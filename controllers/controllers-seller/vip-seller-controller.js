const VipModel = require("../../models/models-cus/vip-model");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const SellerModel = require("../../models/models-seller/seller-model");
const path = require("path");
const e = require("cors");

exports.findBySellerId = async (req, res) => {
  try {
    const { seller_id } = req.seller;
    let new_vip_status = false;
    const vip = await VipModel.findOne({
      where: {
        seller_id: seller_id,
        status: "active",
      },
    });

    const vipNew = await VipModel.findOne({
      where: {
        seller_id: seller_id,
        status: "inactive",
      },
    });

    if (vipNew) {
      new_vip_status = true;
    }

    if (!vip && !vipNew) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "VIP not found for this seller",
      });
    }

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      vip,
      new_vip_status,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: "error",
    });
  }
};

exports.upgradeVip = async (req, res) => {
  try {
    const { seller_id } = req.seller;

    if (!req.files) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Please select an image",
      });
    }

    const existingSeller = await SellerModel.findOne({
      where: {
        id: seller_id,
      },
    });

    if (!existingSeller) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Your not register ..?",
      });
    }

    req.body.customer_id = existingSeller.customer_id;
    req.body.seller_id = existingSeller.id;
    req.body.vip_level = req.body.vip_level;
    req.body.price = req.body.price;
    req.body.status = "inactive";

    if (req.files && req.files.image) {
      const image = req.files.image;
      const allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return res.status(HTTP_BAD_REQUEST).json({
          status: HTTP_BAD_REQUEST,
          msg: "Image must be a valid image file",
        });
      }

      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(
        path.join(__dirname, `../../uploads/images/sellers/${filename}`),
      );

      req.body.image = filename;
    }

    // create Vip
    await VipModel.create(req.body);

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Upgrade vip successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: `sdfsdf ${error.message}`,
    });
  }
};
