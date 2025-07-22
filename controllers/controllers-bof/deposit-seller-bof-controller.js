const SellerModel = require("../../models/models-seller/seller-model");
const DepositSellerModel = require("../../models/models-seller/deposit-seller-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const CompanyAccountModel = require("../../models/models-bof/company-account-model");
const { DEPOSIT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
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

exports.findAllDepositBof = async (req, res) => {
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
      where: { visible: true, ...filter },
      limit,
      offset,
      include: [
        {
          model: SellerModel,
          as: "seller",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        { model: CompanyAccountModel, as: "account" },
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

exports.findDepositByIdBof = async (req, res) => {
  const { id } = req.params;
  try {
    let deposit = await DepositSellerModel.findOne({
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

exports.confirmDepositBof = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user;
  try {
    let deposit = await DepositSellerModel.findOne({
      where: {
        id,
      },
    });
    if (!deposit) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Deposit not found",
      });
    }

    deposit.deposit_status = req.body.deposit_status;
    deposit.user_id = user_id;
    if (req.body.reason) {
      deposit.reason = req.body.reason;
    }

    await deposit.save();
    if (deposit.deposit_status === "approved") {
      await WalletSellerModel.create({
        balance: deposit.amount,
        bonus: 0,
        wallet_type: "deposit",
        seller_id: deposit.seller_id,
        user_id: user_id,
        deposit_id: deposit.id,
      });
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

exports.deleteDeposit = async (req, res) => {
  const { id } = req.params;
  try {
    let data = await DepositSellerModel.findByPk(id);
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

exports.createDepositOfSeller = async (req, res) => {
  const { user_id } = req.user;
  try {
    await WalletSellerModel.create({
      balance: req.body.amount,
      bonus: 0,
      wallet_type: "deposit",
      seller_id: req.body.seller_id,
      user_id: user_id,
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Created success",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
