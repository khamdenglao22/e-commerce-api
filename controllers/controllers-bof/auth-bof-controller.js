const { Op } = require("sequelize");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_FORBIDDEN,
} = require("../../utils/http_status");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userLoginSchema } = require("../../schemas/user-schemas");
const UserBofModel = require("../../models/models-bof/user-bof-model");

exports.loginUser = async (req, res) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ status: HTTP_BAD_REQUEST, msg: error.message });
    }

    const username = req.body.username.trim();
    const password = req.body.password.trim();

    const user = await UserBofModel.findOne({
      where: {
        [Op.and]: [{ username: username }],
      },
    });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(HTTP_FORBIDDEN).send({
        status: HTTP_FORBIDDEN,
        msg: "username ຫຼື password ບໍ່ຖືກຕ້ອງ",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        fullname: user.fullname,
        user_type: user.user_type,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: `24h`,
      }
    );

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, token: token });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.getCurrentUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
  }

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserBofModel.findByPk(decoded.user_id, {
      where: { user_type: "officer" },
    });
    if (!user) {
      return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
    }

    req.user = {
      user_id: user.id,
      fullname: user.fullname,
    };
    next();
  } catch (err) {
    return res.status(401).send({ status: 401, msg: err.message });
  }
};
