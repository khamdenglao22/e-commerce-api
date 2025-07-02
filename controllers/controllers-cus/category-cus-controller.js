const { Sequelize } = require("sequelize");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductModel = require("../../models/models-seller/product-model");
const {
  CATEGORY_MEDIA_URL,
  PRODUCT_MEDIA_URL,
  BASE_MEDIA_URL,
} = require("../../utils/constant");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.customerFindCategory = async (req, res) => {
  const { size } = req.query;
  try {
    let result = await CategoryBofModel.findAll({
      limit: size ? +size : 8,
      order: Sequelize.literal("RAND()"),
    });
    result.map((our) => {
      if (our.image) {
        our.dataValues.image = `${CATEGORY_MEDIA_URL}/${our.image}`;
      } else {
        our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
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

exports.customerFindCategoryById = async (req, res) => {
  const { cate_id } = req.query;

  let filter = {};
  if (cate_id) {
    filter = {
      category_id: cate_id,
    };
  }
  try {
    let result = await ProductModel.findAll({
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          where: { ...filter },
        },
      ],
    });

    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Category not found",
      });
    }

    result.product_master = result.map((our) => {
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
