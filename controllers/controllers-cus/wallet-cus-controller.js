const WalletCusModel = require("../../models/models-cus/wallet-cus-model");
const { QueryTypes } = require("sequelize");
const sequelize = require("../../config");
const DepositCusModel = require("../../models/models-cus/deposit-cus-model");
const OrderModel = require("../../models/order-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.findCustomerWallet = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    let deposit_in = await WalletCusModel.findAll({
      where: {
        customer_id: cus_id,
        wallet_type: "in",
      },
      attributes: ["id", "balance"],
    });

    let deposit_out = await WalletCusModel.findAll({
      where: {
        customer_id: cus_id,
        wallet_type: "out",
      },
      attributes: ["id", "balance"],
    });

    let depositBonus = await WalletCusModel.findAll({
      where: {
        customer_id: cus_id,
      },
      attributes: ["id", "bonus"],
    });

    const order_balance = await OrderModel.findAll({
      where: {
        customer_id: cus_id,
      },
      attributes: ["id", "total_amount"],
    });

    const totalBalanceIn = deposit_in.reduce(
      (sum, item) => sum + item.balance,
      0
    );

    const totalBalanceOut = deposit_out.reduce(
      (sum, item) => sum + item.balance,
      0
    );

    const totalBalanceOrder = order_balance.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );

    const totalBalanceBonus = depositBonus.reduce(
      (sum, item) => sum + item.bonus,
      0
    );

    const totalBalance = totalBalanceIn - (totalBalanceOut + totalBalanceOrder);

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: {
        totalBalance,
        totalBalanceBonus,
      },
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: `error = ${error}`,
    });
  }
};
