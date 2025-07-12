const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const UserBofModel = require("../../models/models-bof/user-bof-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const ProductModel = require("../../models/models-seller/product-model");
const SellerModel = require("../../models/models-seller/seller-model");
const WalletSellerModel = require("../../models/models-seller/wallet-seller-model");
const OrderDetailModel = require("../../models/order-detail-model");
const WithdrawSellerModel = require("../../models/models-seller/withdraw-seller-model");
const {
  SELLER_MEDIA_URL,
  BASE_MEDIA_URL,
  PRODUCT_MEDIA_URL,
} = require("../../utils/constant");
const { HTTP_BAD_REQUEST, HTTP_SUCCESS } = require("../../utils/http_status");
const { Op } = require("sequelize");
const ShopOverviewModel = require("../../models/models-seller/shop-overview-model");

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

    await SellerModel.update(
      { seller_status: req.body.seller_status },
      { where: { id: id } }
    );

    const data_update = await SellerModel.findByPk(id);
    if (data_update.seller_status === "active") {
      const customer_data = await CustomerCusModel.findByPk(result.customer_id);
      const user_req = {
        fullname: customer_data.fullname,
        username: customer_data.email,
        password: customer_data.password,
        user_type: "seller",
        seller_id: data_update.id,
      };
      await UserBofModel.create(user_req);
      await ShopOverviewModel.create({
        seller_id: data_update.id,
        overview_value: 5,
        overview_type: "credit",
      });
    } else {
      await UserBofModel.destroy({
        where: { seller_id: data_update.id },
      });
    }

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

exports.findSellerById = async (req, res) => {
  const { id } = req.params;
  try {
    let result = await SellerModel.findByPk(id, {
      include: [
        {
          model: CustomerCusModel,
          as: "customer",
        },
        {
          model: ProductModel,
          as: "products",
          include: [
            {
              model: ProductMasterBofModel,
              as: "product_master",
              attributes: { exclude: ["createdAt", "updatedAt"] },
              include: [
                {
                  model: CategoryBofModel,
                  as: "category",
                  attributes: { exclude: ["createdAt", "updatedAt"] },
                },
                {
                  model: BrandBofModel,
                  as: "brand",
                  attributes: { exclude: ["createdAt", "updatedAt"] },
                },
              ],
            },
          ],
        },
      ],
    });
    let productOfSeller = await ProductModel.count({
      where: { seller_id: id },
    });

    result.dataValues.productTotalQty = productOfSeller;

    if (!result) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller not found",
      });
    }
    if (result.front_document && result.back_certificate) {
      result.dataValues.front_document = `${SELLER_MEDIA_URL}/${result.front_document}`;
      result.dataValues.back_certificate = `${SELLER_MEDIA_URL}/${result.back_certificate}`;
    } else {
      result.dataValues.front_document = `${BASE_MEDIA_URL}/600x400.svg`;
    }

    result.products = result.products.map((our) => {
      if (our.product_master.image) {
        our.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product_master.image}`;
      } else {
        our.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findSumWallet = async (req, res) => {
  const { seller_id } = req.params;
  //console.log("seller_id=========", seller_id);
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
