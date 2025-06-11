const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const { SELLER_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const { HTTP_BAD_REQUEST, HTTP_SUCCESS } = require("../../utils/http_status");
const { Op } = require("sequelize");

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

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await CustomerCusModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller not found",
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
