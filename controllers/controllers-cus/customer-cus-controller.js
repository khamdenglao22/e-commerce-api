const bcrypt = require("bcryptjs");
const { HTTP_BAD_REQUEST, HTTP_SUCCESS } = require("../../utils/http_status");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { customerCreateSchema } = require("../../schemas/customer-schemas");

function passwordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

exports.createCustomer = async (req, res) => {
  try {
    const { error } = customerCreateSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    // check exiting email
    const existingCustomer = await CustomerCusModel.findOne({
      where: {
        [Op.or]: [{ email: req.body.email }],
      },
    });
    if (existingCustomer) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Email already exists",
      });
    }

    req.body.password = req.body.password.trim();
    // hash password
    // req.body.password = passwordHash(req.body.password);
    let result = await CustomerCusModel.create(req.body);
    delete result.dataValues.password;
    const token = jwt.sign(
      {
        cus_id: result.id,
        fullname: result.fullname,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: `24h`,
      }
    );

    res.status(HTTP_SUCCESS).send({ token: token });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    let result = await CustomerCusModel.findByPk(cus_id, {
      attributes: { exclude: ["password"] },
    });
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Customer not found",
      });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
