const { Sequelize, Op } = require("sequelize");
const ProductModel = require("../../models/models-seller/product-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const ProductGalleryBofModel = require("../../models/models-bof/product-gallery-bof-model");
const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const SellerModel = require("../../models/models-seller/seller-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");

exports.findProduct = async (req, res) => {
  const { size } = req.query;
  try {
    let products = await ProductModel.findAll({
      limit: size ? +size : 10,
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
        },
        {
          model: SellerModel,
          as: "seller",
          attributes: ["id", "store_name", "email"],
        },
      ],
      order: Sequelize.literal("RAND()"),
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

exports.findProductById = async (req, res) => {
  const { id } = req.params;
  try {
    let product = await ProductModel.findOne({
      where: { id },
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: ProductGalleryBofModel,
              as: "product_gallery",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: BrandBofModel,
              as: "brand",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: CategoryBofModel,
              as: "category",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: ProductSizeOptionModel,
              as: "sizeOptions",
            },
            {
              model: ProductColorOptionModel,
              as: "colorOptions",
            },
          ],
        },
        {
          model: SellerModel,
          as: "seller",
          attributes: ["id", "store_name", "email"],
        },
      ],
    });
    if (!product) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product not found",
      });
    }
    if (product.product_master.product_gallery) {
      product.product_master.product_gallery =
        product.product_master.product_gallery.map((gallery) => {
          if (gallery.image) {
            gallery.image = `${PRODUCT_MEDIA_URL}/${gallery.image}`;
          } else {
            gallery.image = `${BASE_MEDIA_URL}/600x400.svg`;
          }
          return gallery;
        });
    }
    if (product.product_master.image) {
      product.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${product.product_master.image}`;
    } else {
      product.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: product,
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
  //   console.log("+size", +size, "offset", offset);
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: result } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, result, totalPages, currentPage };
};

exports.findAllProductSearch = async (req, res) => {
  const { page, size, seller_id, category_id, brand_id } = req.query;
  const { limit, offset } = getPagination(page, size);

  let filter = {};
  let filterBySeller = {};
  if (seller_id) {
    filterBySeller = { seller_id };
  }
  // console.log("filter", filter);

  if (category_id && !brand_id) {
    filter = {
      [Op.and]: [{ category_id: category_id }],
    };
  } else if (!category_id && brand_id) {
    filter = {
      [Op.and]: [{ brand_id: brand_id }],
    };
  } else if (category_id && brand_id) {
    filter = {
      [Op.and]: [{ category_id: category_id }, { brand_id: brand_id }],
    };
  }

  try {
    let productMaster = await ProductModel.findAndCountAll({
      order: [["id", "DESC"]],
      where: { product_status: "active", ...filterBySeller },
      limit,
      offset,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          where: { ...filter },
          // include: [
          //   {
          //     model: BrandBofModel,
          //     as: "brand",
          //     attributes: { exclude: ["createdAt", "updatedAt"] },
          //   },
          //   {
          //     model: CategoryBofModel,
          //     as: "category",
          //     attributes: { exclude: ["createdAt", "updatedAt"] },
          //   },
          // ],
        },
        {
          model: SellerModel,
          as: "seller",
          attributes: ["id", "store_name", "email"],
        },
      ],
    });

    const response = getPagingData(productMaster, page, limit);
    response.result = response.result.map((our) => {
      if (our.product_master.image) {
        our.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product_master.image}`;
      } else {
        our.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });

    res.json(response);
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
