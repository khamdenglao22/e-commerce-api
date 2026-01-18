const VipModel = require("../../models/models-cus/vip-model");
const { HTTP_BAD_REQUEST, HTTP_CREATED } = require("../../utils/http_status");
const path = require("path");

exports.createVip = async (req, res) => {
  try {
    const { cus_id } = req.customer;

    if (!req.files) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Please select an image",
      });
    }

    const existingSeller = await SellerModel.findOne({
      where: {
        customer_id: cus_id,
      },
    });

    if (!existingSeller) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Your not register ..?",
      });
    }

    req.body.customer_id = cus_id;
    req.body.seller_id = existingSeller.seller_id;
    req.body.vip_level = req.body.vip_level;
    req.body.price = req.body.price;

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

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "Create vip successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
