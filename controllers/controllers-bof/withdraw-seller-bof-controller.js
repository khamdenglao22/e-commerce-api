const SellerModel = require("../../models/models-seller/seller-model");
// const DepositSellerModel = require("../../models/models-seller/deposit-seller-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
// const CompanyAccountModel = require("../../models/models-bof/company-account-model");
const WithdrawSellerModel = require("../../models/models-seller/withdraw-seller-model");
const { DEPOSIT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const { Op } = require("sequelize");
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

exports.findAllWithdrawBof = async (req, res) => {
  const { page, size, withdraw_status, fromDate, toDate } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  if (withdraw_status) {
    filter = {
      withdraw_status: withdraw_status,
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
    let deposit = await WithdrawSellerModel.findAndCountAll({
      order: [["id", "DESC"]],
      where: { visible: true, ...filter },
      limit,
      offset,
      include: [
        {
          model: SellerModel,
          as: "seller",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
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

exports.findWithdrawByIdBof = async (req, res) => {
  const { id } = req.params;
  try {
    let deposit = await WithdrawSellerModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: SellerModel,
          as: "seller",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!deposit) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Deposit not found",
      });
    }

    if (deposit.image) {
      deposit.dataValues.image = `${DEPOSIT_MEDIA_URL}/${deposit.image}`;
    } else {
      deposit.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: deposit,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.confirmWithdrawBof = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user;
  try {
    let withdraw = await WithdrawSellerModel.findOne({
      where: {
        id,
      },
    });
    if (!withdraw) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Withdraw not found",
      });
    }

    withdraw.withdraw_status = req.body.withdraw_status;
    withdraw.user_id = user_id;
    if (req.body.reason) {
      withdraw.reason = req.body.reason;
    }

    // Upload image
    if (req.files && req.files.image) {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return res.json({
          status: 400,
          msg: "ຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(
        path.join(__dirname, `../../uploads/images/deposit/${filename}`)
      );
      console.log("Image uploaded successfully===", filename);
      withdraw.image = filename;
    }

    await withdraw.save();

    if (withdraw.deposit_status === "approved") {
      await WalletSellerModel.create({
        balance: withdraw.amount,
        bonus: 0,
        wallet_type: "widthdraw",
        seller_id: withdraw.seller_id,
        user_id: user_id,
        withdraw_id: withdraw.id,
      });
    }

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: withdraw,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteWithdraw = async (req, res) => {
  const { id } = req.params;
  try {
    let data = await WithdrawSellerModel.findByPk(id);
    if (!data) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "not found",
      });
    }
    data.visible = false;
    await data.save();

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
