const ProductModel = require("../../models/models-seller/product-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const WithdrawSellerModel = require("../../models/models-seller/withdraw-seller-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const { fn, col, literal, Sequelize } = require("sequelize");

exports.findSumWallet = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    let totalWithdrawableAmount = await WalletSellerModel.sum("balance", {
      where: { wallet_Type: ["deposit"], seller_id },
    });

    if (totalWithdrawableAmount === null && totalWithdrawableAmount < 0)
      totalWithdrawableAmount = 0;

    let dataProfit = await WalletSellerModel.findAll({
      where: { wallet_Type: "profit", seller_id },
      include: [
        {
          model: OrderDetailModel,
          as: "order_details",
          where: { order_detail_status: "complete" },
        },
      ],
    });

    let totalProfitAmount = 0;
    if (dataProfit.length > 0) {
      totalProfitAmount = dataProfit.reduce(
        (sum, item) => parseFloat(sum) + parseFloat(item.bonus),
        0
      );
    }

    let dataFrozen = await WalletSellerModel.findAll({
      where: { wallet_Type: "profit", seller_id },
      include: [
        {
          model: OrderDetailModel,
          as: "order_details",
          where: { order_detail_status: ["confirm", "delivery"] },
        },
      ],
    });

    let totalFrozenAmount = 0;
    if (dataFrozen.length > 0) {
      totalFrozenAmount = dataFrozen.reduce(
        (sum, item) => parseFloat(sum) + parseFloat(item.bonus),
        0
      );
    }

    let totalWithdrawAmount = await WithdrawSellerModel.sum("amount", {
      where: { withdraw_status: "approved", seller_id },
    });
    if (totalWithdrawAmount === null) totalWithdrawAmount = 0;

    let totalWithdraw = await WithdrawSellerModel.sum("amount", {
      where: { withdraw_status: ["approved", "pending"], seller_id },
    });

    if (totalWithdraw === null) totalWithdraw = 0;

    let dataOrderAmount = await OrderDetailModel.findAll({
      where: { order_detail_status: ["confirm", "complete"] },
      include: [{ model: ProductModel, as: "product", where: { seller_id } }],
    });

    let totalOrderAmount = 0;
    if (dataOrderAmount.length > 0) {
      totalOrderAmount = dataOrderAmount.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    let dataOrderAmountComplete = await OrderDetailModel.findAll({
      where: { order_detail_status: "complete" },
      include: [{ model: ProductModel, as: "product", where: { seller_id } }],
    });

    let totalOrderAmountComplete = 0;
    if (dataOrderAmountComplete.length > 0) {
      totalOrderAmountComplete = dataOrderAmountComplete.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    let totalRecharged = 0;
    totalRecharged = totalWithdrawableAmount;

    let withdrawableProfit = 0;
    withdrawableProfit = totalWithdrawableAmount + totalProfitAmount;

    totalWithdrawableAmount =
      withdrawableProfit - (totalOrderAmount + totalWithdraw);

    if (totalWithdrawableAmount <= 0) {
      totalWithdrawableAmount = 0;
    }

    let totalWalletBalance;
    totalWalletBalance = totalWithdrawableAmount + totalFrozenAmount;

    res.status(200).json({
      totalWithdrawableAmount,
      totalProfitAmount,
      totalFrozenAmount,
      totalWithdrawAmount,
      totalWithdraw,
      totalOrderAmount,
      totalWalletBalance,
      totalRecharged,
      totalOrderAmountComplete
    });
  } catch (error) {
    res.status(400).json({ status: 400, msg: error.message });
  }
};
