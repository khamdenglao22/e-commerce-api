const ProductModel = require("../../models/models-seller/product-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const WithdrawSellerModel = require("../../models/models-seller/withdraw-seller-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");
const { fn, col, literal, Sequelize } = require("sequelize");

exports.findSumWallet = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    let totalWalletBalance = await WalletSellerModel.sum("balance", {
      where: { wallet_Type: ["deposit"], seller_id },
    });
    if (totalWalletBalance === null) totalWalletBalance = 0;

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
      where: { withdraw_status: ["approved"], seller_id },
    });
    if (totalWithdrawAmount === null) totalWithdrawAmount = 0;

    let dataOrderAmount = await OrderDetailModel.findAll({
      where: { order_detail_status: ["confirm", "delivery"] },
      include: [{ model: ProductModel, as: "product", where: { seller_id } }],
    });

    let totalOrderAmount = 0;
    if (dataOrderAmount.length > 0) {
      totalOrderAmount = dataOrderAmount.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }

    totalWalletBalance =
      totalWalletBalance +
      totalProfitAmount -
      (totalOrderAmount + totalWithdrawAmount);

    res.status(200).json({
      totalWalletBalance,
      totalProfitAmount,
      totalFrozenAmount,
      totalWithdrawAmount,
      totalOrderAmount,
    });
  } catch (error) {
    res.status(400).json({ status: 400, msg: error.message });
  }
};
