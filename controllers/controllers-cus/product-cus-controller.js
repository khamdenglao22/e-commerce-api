const { Sequelize } = require("sequelize");
const ProductModel = require("../../models/models-seller/product-model");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const ProductGalleryBofModel = require("../../models/models-bof/product-gallery-bof-model");
const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");
const SellerModel = require("../../models/models-seller/seller-model");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const ProductSizeModel = require("../../models/models-bof/product-size-model");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");
const ProductColorModel = require("../../models/models-bof/product-color-model");

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
              attributes: ["id"],
              include: [
                {
                  model: ProductSizeModel,
                  as: "sizes",
                  attributes: { exclude: ["category_id"] },
                },
              ],
            },
            {
              model: ProductColorOptionModel,
              as: "colorOptions",
              attributes: ["id"],
              include: [
                {
                  model: ProductColorModel,
                  as: "colors",
                  attributes: ["id", "color_code"],
                },
              ],
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
