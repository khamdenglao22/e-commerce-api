const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const SellerModel = require("../../models/models-seller/seller-model");
const OrderDetailModel = require("../../models/order-detail-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.totalCountAll = async (req, res) => {
  try {
    const resultProductMaster = await ProductMasterBofModel.count();
    const resultSeller = await SellerModel.count({
      where: {
        seller_status: "active",
      },
    });
    const resultCustomer = await CustomerCusModel.count();
    let totalOrder = await OrderDetailModel.count({
      where: { order_detail_status: "complete" },
    });

    if (totalOrder === null) totalOrder = 0;

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      totalProductMaster: resultProductMaster,
      totalSeller: resultSeller,
      totalCustomer: resultCustomer,
      totalOrder,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
