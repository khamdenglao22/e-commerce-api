const SellerModel = require("../../models/models-seller/seller-model");
require("dotenv").config();
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_NOT_FOUND,
} = require("../../utils/http_status");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const UserBofModel = require("../../models/models-bof/user-bof-model");

exports.createSeller = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    // console.log("req.customer====", req.customer);

    if (!req.files) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Please select an image",
      });
    }
    req.body.customer_id = cus_id;
    req.body.store_name = req.body.store_name.trim();
    // const existingSeller = await SellerModel.findOne({
    //   where: {
    //     store_name: req.body.store_name,
    //   },
    // });
    // if (existingSeller) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     status: HTTP_BAD_REQUEST,
    //     msg: "Store name already exists",
    //   });
    // }
    if (req.files && req.files.front_document && req.files.back_certificate) {
      const front_document = req.files.front_document;
      const back_certificate = req.files.back_certificate;

      const allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(front_document.mimetype)) {
        return res.status(HTTP_BAD_REQUEST).json({
          status: HTTP_BAD_REQUEST,
          msg: "Image must be a valid image file",
        });
      }
      if (!allowFiles.includes(back_certificate.mimetype)) {
        return res.status(HTTP_BAD_REQUEST).json({
          status: HTTP_BAD_REQUEST,
          msg: "Image must be a valid image file",
        });
      }
      const ext_front_document = path.extname(front_document.name);
      const filename_front_document = Date.now() + ext_front_document;
      front_document.mv(
        path.join(
          __dirname,
          `../../uploads/images/sellers/${filename_front_document}`
        )
      );
      const ext_back_certificate = path.extname(back_certificate.name);
      const filename_back_certificate = Date.now() + ext_back_certificate;
      back_certificate.mv(
        path.join(
          __dirname,
          `../../uploads/images/sellers/${filename_back_certificate}`
        )
      );
      req.body.front_document = filename_front_document;
      req.body.back_certificate = filename_back_certificate;
    }

    // const customer_data = await CustomerCusModel.findByPk(cus_id);

    // create seller to user
    await SellerModel.create(req.body);

    // start transaction
    // await sequelize.transaction(async (t) => {
    //   // create seller
    //   await SellerModel.create(req.body, {
    //     transaction: t,
    //   });

    //     const user_req = {
    //       fullname: customer_data.fullname,
    //       username: customer_data.email,
    //       password: customer_data.password,
    //       role_id: 1,
    //       user_type: "seller",
    //       seller_id: seller_new.id,
    //     };

    //     await UserBofModel.create(user_req, {
    //       transaction: t,
    //     });
    // });

    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "Create seller successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findSellerByCusId = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    let result = await SellerModel.findOne({
      where: { customer_id: cus_id },
    });

    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Seller not found",
      });
    }

    const userData = await UserBofModel.findOne({
      where: { seller_id: result.id },
    });

    // console.log(`password : ${userData.dataValues.password}`);

    result.dataValues.data_user = userData;

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: result });
  } catch (e) {
    console.log(e);
    res.status(HTTP_BAD_REQUEST).json({ status: HTTP_BAD_REQUEST, msg: e.message });
  }
};
