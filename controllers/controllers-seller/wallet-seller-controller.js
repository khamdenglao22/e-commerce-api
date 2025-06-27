const ProductModel = require("../../models/models-seller/product-model");
const WalletSeller = require("../../models/models-seller/wallet-seller-model");
const WithdrawSellerModel = require("../../models/models-seller/withdraw-seller-model");
const OrderDetailModel = require("../../models/order-detail-model");
const OrderModel = require("../../models/order-model");

exports.findSumWallet = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    let totalWallet = await WalletSeller.sum("balance", {
      where: { wallet_Type: ["deposit", "pro"], seller_id },
    });

    let totalRecharge = await WalletSeller.sum("balance", {
      where: { wallet_Type: "deposit", seller_id },
    });

    let totalOrder = await OrderDetailModel.sum("price", {
      where: { order_detail_status: ["confirm", "delivery"] },
      include: [
        {
          model: ProductModel,
          as: "product",
          where: { seller_id },
        },
      ],
    });

    let totalWithdraw = await WalletSeller.sum("balance", {
      where: { seller_id, wallet_Type: "widthdraw" },
    });

    if (totalWithdraw === null) totalWithdraw = 0;
    if (totalOrder === null) totalOrder = 0;
    if (totalRecharge === null) totalRecharge = 0;
    if (totalWallet === null) totalWallet = 0;

    totalWallet = totalWallet - (totalWithdraw + totalOrder);

    res.status(200).json({
      status: 200,
      totalWallet,
      totalFrozen: totalOrder,
      totalWithdraw,
      totalRecharge,
    });
  } catch (error) {
    res.status(400).json({ status: 400, msg: error });
  }
};
