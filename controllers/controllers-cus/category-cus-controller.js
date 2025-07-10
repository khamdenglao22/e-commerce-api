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
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const SellerModel = require("../../models/models-seller/seller-model");

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

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page && page > 0 ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.customerFindCategoryById = async (req, res) => {
  const { page, size, cate_id } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  if (cate_id) {
    filter = {
      category_id: cate_id,
    };
  }
  try {
    let result = await ProductModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          where: { ...filter },
        },
        {
          model: SellerModel,
          as: "seller",
        },
      ],
    });

    // if (!result) {
    //   return res.status(HTTP_NOT_FOUND).json({
    //     status: HTTP_NOT_FOUND,
    //     msg: "Category not found",
    //   });
    // }

    const response = getPagingData(result, page, limit);

    response.result = response.result.map((our) => {
      if (our.product_master.image) {
        our.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product_master.image}`;
      } else {
        our.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.status(HTTP_SUCCESS).json(response);
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
