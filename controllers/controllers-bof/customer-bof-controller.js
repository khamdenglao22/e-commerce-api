const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const { SELLER_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  //   console.log("+size", +size, "offset", offset);
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.findCustomerAll = async (req, res) => {
  const { page, size, fullname, customer_status } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  if (fullname) {
    filter = {
      fullname: { [Op.like]: `%${fullname}%` },
    };
  }

  if (customer_status) {
    filter = {
      ...filter,
      customer_status: customer_status,
    };
  }

  try {
    await CustomerCusModel.findAndCountAll({
      order: [["id", "DESC"]],
      attributes: { exclude: ["password"] },
      where: { ...filter },
      limit,
      offset,
    })
      .then((data) => {
        const response = getPagingData(data, page, limit);
        res.json(response);
      })
      .catch((err) => {
        res
          .status(HTTP_BAD_REQUEST)
          .json({ status: HTTP_BAD_REQUEST, msg: err.message });
      });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.findCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await CustomerCusModel.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!result) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller not found",
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

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await CustomerCusModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Customer not found",
      });
    }
    await CustomerCusModel.update(
      { customer_status: req.body.customer_status },
      { where: { id: id } }
    );
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Confirm customer successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

function passwordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

exports.createCustomer = async (req, res) => {
  try {
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
    req.body.password = passwordHash(req.body.password);
    let result = await CustomerCusModel.create(req.body);
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

exports.updateCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await CustomerCusModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Seller not found",
      });
    }
    req.body.password = req.body.password.trim();
    req.body.password = passwordHash(req.body.password);
    await CustomerCusModel.update(req.body, {
      where: { id },
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Customer updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
