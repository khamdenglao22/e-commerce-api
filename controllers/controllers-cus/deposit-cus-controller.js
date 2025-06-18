const DepositCusModel = require("../../models/models-cus/deposit-cus-model");
const { DEPOSIT_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_CREATED,
} = require("../../utils/http_status");
const path = require("path");

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

exports.findAllDepositCus = async (req, res) => {
  const { cus_id } = req.customer;
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  try {
    let deposit = await DepositCusModel.findAndCountAll({
      order: [["id", "DESC"]],
      limit,
      offset,
      where: {
        customer_id: cus_id,
      },
    });

    const response = getPagingData(deposit, page, limit);
    response.result = response.result.map((our) => {
      if (our.image) {
        our.dataValues.image = `${DEPOSIT_MEDIA_URL}/${our.image}`;
      } else {
        our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });
    res.json(response);
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findDepositByIdCus = async (req, res) => {
  const { id } = req.params;
  const { cus_id } = req.customer;
  try {
    let deposit = await DepositCusModel.findOne({
      where: {
        id,
        customer_id: cus_id,
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

exports.createDepositCus = async (req, res) => {
  const { cus_id } = req.customer;
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
    req.body.customer_id = cus_id;
    const deposit = await DepositCusModel.create(req.body);
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
