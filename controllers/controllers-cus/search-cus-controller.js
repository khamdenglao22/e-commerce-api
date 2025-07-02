const { Op } = require("sequelize");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductModel = require("../../models/models-seller/product-model");
const {
  PRODUCT_MEDIA_URL,
  BASE_MEDIA_URL,
  BRAND_MEDIA_URL,
  CATEGORY_MEDIA_URL,
} = require("../../utils/constant");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");
const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const SellerModel = require("../../models/models-seller/seller-model");

exports.findProductSearch = async (req, res) => {
  const { p_name } = req.query;
  try {
    let products = await ProductModel.findAll({
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          where: {
            [Op.or]: [
              { name_en: { [Op.like]: `%${p_name}%` } },
              { name_th: { [Op.like]: `%${p_name}%` } },
              { name_ch: { [Op.like]: `%${p_name}%` } },
            ],
          },
        },
      ],
    });

    products.product_master = products.map((our) => {
      if (our.product_master.image) {
        our.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product_master.image}`;
      } else {
        our.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: products,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findBrandSearch = async (req, res) => {
  const { name } = req.query;
  // console.log(name);
  try {
    let brands = await BrandBofModel.findAll({
      where: {
        [Op.or]: [
          { name_en: { [Op.like]: `%${name}%` } },
          { name_th: { [Op.like]: `%${name}%` } },
          { name_ch: { [Op.like]: `%${name}%` } },
        ],
      },
    });

    brands = brands.map((our) => {
      if (our.image) {
        our.dataValues.image = `${BRAND_MEDIA_URL}/${our.image}`;
      } else {
        our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: brands,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findCategorySearch = async (req, res) => {
  const { name } = req.query;
  try {
    let category = await CategoryBofModel.findAll({
      where: {
        [Op.or]: [
          { name_en: { [Op.like]: `%${name}%` } },
          { name_th: { [Op.like]: `%${name}%` } },
          { name_ch: { [Op.like]: `%${name}%` } },
        ],
      },
    });

    category = category.map((our) => {
      if (our.image) {
        our.dataValues.image = `${CATEGORY_MEDIA_URL}/${our.image}`;
      } else {
        our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: category,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findSellerSearch = async (req, res) => {
  const { name } = req.query;
  try {
    let store = await SellerModel.findAll({
      where: {
        store_name: { [Op.like]: `%${name}%` },
      },
    });

    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: store,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
