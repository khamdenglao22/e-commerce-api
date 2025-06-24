const SellerModel = require("../../models/models-seller/seller-model");
const { sellerSchema } = require("../../schemas/seller-schemas");
const {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
} = require("../../utils/http_status");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");
const sequelize = require("../../config");
const UserBofModel = require("../../models/models-bof/user-bof-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");

const { SELLER_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");

exports.findSellerById = async (req, res) => {
  try {
    const { seller_id } = req.seller;
    let result = await SellerModel.findOne({
      include: [
        {
          model: CustomerCusModel,
          as: "customer",
        },
      ],
      where: {
        [Op.and]: [{ id: seller_id }, { seller_status: "active" }],
      },
    });
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
      result.dataValues.back_certificate = `${BASE_MEDIA_URL}/600x400.svg`;
    }
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

exports.createSeller = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    console.log("req.customer====", req.customer);
    if (!cus_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Customer ID not found",
      });
    }
    if (!req.files) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Please select an image",
      });
    }
    req.body.customer_id = cus_id;
    const { error } = sellerSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }

    req.body.store_name = req.body.store_name.trim();
    const existingSeller = await SellerModel.findOne({
      where: {
        store_name: req.body.store_name,
      },
    });
    if (existingSeller) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Store name already exists",
      });
    }
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

    const customer_data = await CustomerCusModel.findByPk(cus_id);
    // create seller to user

    // start transaction
    await sequelize.transaction(async (t) => {
      // create seller
      const seller_new = await SellerModel.create(req.body, {
        transaction: t,
      });

      const user_req = {
        fullname: customer_data.fullname,
        username: customer_data.email,
        password: customer_data.password,
        role_id: 1,
        user_type: "seller",
        seller_id: seller_new.id,
      };

      await UserBofModel.create(user_req, {
        transaction: t,
      });
    });

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

exports.updateSeller = async (req, res) => {
  try {
    // const { cus_id, seller_id } = req.customer;
    const { seller_id } = req.seller;
    // if (!cus_id) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     status: HTTP_BAD_REQUEST,
    //     msg: "Customer ID not found",
    //   });
    // }
    if (!seller_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller ID not found",
      });
    }
    // const { error } = sellerSchema.validate(req.body);
    // if (error) {
    //   return res.status(HTTP_BAD_REQUEST).json({
    //     status: HTTP_BAD_REQUEST,
    //     msg: error.message,
    //   });
    // }

    req.body.store_name = req.body.store_name.trim();
    const existingSeller = await SellerModel.findOne({
      where: {
        store_name: req.body.store_name,
        id: { [Op.ne]: seller_id },
      },
    });
    if (existingSeller) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Store name already exists",
      });
    }
    const seller = await SellerModel.findByPk(seller_id);
    if (!seller) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Seller not found",
      });
    }
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
    await SellerModel.update(req.body, {
      where: {
        id: seller_id,
      },
    });
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "Update seller successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
