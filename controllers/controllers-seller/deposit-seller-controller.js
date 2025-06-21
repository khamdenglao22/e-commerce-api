const DepositSellerModel = require("../../models/models-seller/deposit-seller-model");
const CompanyAccountModel = require("../../models/models-bof/company-account-model")
const { DEPOSIT_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  BASE_MEDIA_URL,
} = require("../../utils/http_status");
const path = require("path");
const { Op } = require("sequelize");

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.findAllDeposit = async (req, res) => {
  const { seller_id } = req.seller;
  const { page, size, deposit_status, fromDate, toDate } = req.query;
  const { limit, offset } = getPagination(page, size);
  let filter = {};
  if (deposit_status) {
    filter = {
      deposit_status: deposit_status,
    };
  }
  if (fromDate && toDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0); // Start of day

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // End of day

    filter.createdAt = {
      [Op.between]: [start, end],
    };
  }
  try {
    let deposit = await DepositSellerModel.findAndCountAll({
      order: [["id", "DESC"]],
      limit,
      offset,
      include: { model: CompanyAccountModel, as: "account" },
      where: {
        seller_id,
        ...filter,
      },
    });

    const response = getPagingData(deposit, page, limit);
    response.result = response.result.map((row) => {
      if (row.image) {
        row.dataValues.image = `${DEPOSIT_MEDIA_URL}/${row.image}`;
      } else {
        row.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return row;
    });

    res.status(HTTP_SUCCESS).json(response);
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findDepositById = async (req, res) => {
  const { id } = req.params;
  const { seller_id } = req.seller;
  try {
    let deposit = await DepositSellerModel.findOne({
      where: {
        id,
        seller_id,
      },
    });
    if (!deposit) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Deposit not found",
      });
    }

    if (deposit.image) {
      deposit.dataValues.image = `${DEPOSIT_MEDIA_URL}/${deposit.image}`;
    } else {
      deposit.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: deposit });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createDeposit = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    if (!req.files) {
      delete req.body.image;
    }

    // Upload image
    if (req.files && req.files.image) {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return next({
          status: 400,
          msg: "ຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(
        path.join(__dirname, `../../uploads/images/deposit/${filename}`)
      );
      req.body.image = filename;
    }
    req.body.seller_id = seller_id;
    const deposit = await DepositSellerModel.create(req.body);
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: deposit,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
