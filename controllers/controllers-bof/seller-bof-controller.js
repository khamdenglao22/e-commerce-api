const SellerModel = require("../../models/models-seller/seller-model");
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

exports.findSellerAll = async (req, res) => {
  const { page, size, store_name, seller_status } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  if (store_name) {
    filter = {
      store_name: { [Op.like]: `%${store_name}%` },
    };
  }

  if (seller_status) {
    filter = {
      ...filter,
      seller_status: seller_status,
    };
  }

  try {
    await SellerModel.findAndCountAll({
      order: [["id", "DESC"]],
      where: { ...filter },
      limit,
      offset,
    })
      .then((data) => {
        const response = getPagingData(data, page, limit);
        response.result = response.result.map((our) => {
          if (our.front_document && our.back_certificate) {
            our.dataValues.front_document = `${SELLER_MEDIA_URL}/${our.front_document}`;
            our.dataValues.back_certificate = `${SELLER_MEDIA_URL}/${our.back_certificate}`;
          } else {
            our.dataValues.front_document = `${BASE_MEDIA_URL}/600x400.svg`;
            our.dataValues.back_certificate = `${BASE_MEDIA_URL}/600x400.svg`;
          }
          return our;
        });
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

exports.confirmSeller = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await SellerModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller not found",
      });
    }
    await SellerModel.update({ seller_status: 2 }, { where: { id: id } });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Confirm seller successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
