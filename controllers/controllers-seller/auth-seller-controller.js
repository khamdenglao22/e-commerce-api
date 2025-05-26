const UserBofModel = require("../../models/models-bof/user-bof-model");
const { Op } = require("sequelize");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_FORBIDDEN,
} = require("../../utils/http_status");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userLoginSchema } = require("../../schemas/user-schemas");
const SellerModel = require("../../models/models-seller/seller-model");

exports.getCurrentSeller = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
  }

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserBofModel.findByPk(decoded.user_id, {
      where: { user_type: decoded.user_type },
    });
    if (!user) {
      return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
    }

    const seller = await SellerModel.findOne({
      where: {
        [Op.and]: [{ id: user.seller_id }, { seller_status: 2 }],
      },
    });
    if (!seller) {
      return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ " });
    }

    if (user.user_type !== "seller") {
      return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
    }

    req.seller = {
      seller_id: seller.id,
      fullname: seller.fullname,
    };
    next();
  } catch (err) {
    return res.status(401).send({ status: 401, msg: `${err.message}` });
  }
};
