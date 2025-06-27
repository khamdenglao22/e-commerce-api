const { Op } = require("sequelize");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const { customerLoginSchema } = require("../../schemas/customer-schemas");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_FORBIDDEN,
} = require("../../utils/http_status");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SellerModel = require("../../models/models-seller/seller-model");

function passwordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

exports.loginCustomer = async (req, res) => {
  try {
    const { error, value } = customerLoginSchema.validate(req.body);
    if (error) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ status: HTTP_BAD_REQUEST, msg: error.message });
    }

    const email = req.body.email.trim();
    const password = req.body.password.trim();

    const customer = await CustomerCusModel.findOne({
      where: {
        [Op.and]: [{ email: email }],
      },
    });
    if (
      !customer ||
      !bcrypt.compareSync(password, passwordHash(customer.password))
    ) {
      return res.status(HTTP_FORBIDDEN).send({
        status: HTTP_FORBIDDEN,
        msg: "username ຫຼື password ບໍ່ຖືກຕ້ອງ",
      });
    }

    const token = jwt.sign(
      {
        cus_id: customer.id,
        fullname: customer.fullname,
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

exports.getCurrentCustomer = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
  }

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const customer = await CustomerCusModel.findByPk(decoded.cus_id);
    if (!customer) {
      return res.status(401).send({ status: 401, msg: "ກະລຸນາເຂົ້າສູ່ລະບົບ" });
    }

    req.customer = {
      cus_id: customer.id,
      fullname: customer.fullname,
    };
    next();
  } catch (err) {
    return res
      .status(401)
      .send({ status: 401, msg: `ກະລຸນາເຂົ້າສູ່ລະບົບ 3 ${err.message}` });
  }
};
