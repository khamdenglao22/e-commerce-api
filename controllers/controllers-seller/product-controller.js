const { Op } = require("sequelize");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductModel = require("../../models/models-seller/product-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
} = require("../../utils/http_status");
const BrandBofModel = require("../../models/models-bof/brand-bof-model");
const CategoryBofModel = require("../../models/models-bof/category-bof-model");

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

exports.findAllProduct = async (req, res) => {
  const { page, size, category_id, brand_id, p_name } = req.query;
  const { limit, offset } = getPagination(page, size);
  const { seller_id } = req.seller;

  try {
    const products = await ProductModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: ProductMasterBofModel,
          as: "product_master",
          where: {
            ...(category_id && { category_id: category_id }),
            ...(brand_id && { brand_id: brand_id }),
            ...(p_name && {
              [Op.or]: [
                { name_en: { [Op.like]: `%${p_name}%` } },
                { name_th: { [Op.like]: `%${p_name}%` } },
                { name_ch: { [Op.like]: `%${p_name}%` } },
              ],
            }),
          },
        },
      ],
      order: [["id", "DESC"]],
      attributes: { exclude: ["product_id", "seller_id"] },
      where: {
        seller_id,
      },
    });
    let response = getPagingData(products, page, limit);
    response.result.product_master = response.result.map((our) => {
      if (our.product_master.image) {
        our.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.product_master.image}`;
      } else {
        our.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return our;
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: response,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { seller_id } = req.seller;
    const { product_id } = req.body;
    for (let i = 0; i < product_id.length; i++) {
      const existingProduct = await ProductModel.findOne({
        where: {
          [Op.and]: [{ product_id: product_id[i] }, { seller_id: seller_id }],
        },
      });
      if (existingProduct) {
        product_id = product_id.filter((id) => id !== product_id[i]);
      }
    }

    if (product_id.length === 0) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "All products already exist for this seller",
      });
    }

    const newProduct = await ProductModel.bulkCreate(
      product_id.map((id) => ({ seller_id, product_id: id }))
    );
    if (!newProduct) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product creation failed",
      });
    }
    res.status(HTTP_CREATED).json({ status: HTTP_CREATED, data: newProduct });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_status } = req.body;
    const { seller_id } = req.seller;

    const product = await ProductModel.findOne({
      where: {
        [Op.and]: [
          {
            id: id,
          },
          {
            seller_id: seller_id,
          },
        ],
      },
    });
    if (!product) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Product not found",
      });
    }

    product.product_status = product_status;
    await product.save();

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

exports.findAllProductMaster = async (req, res) => {
  const { page, size, p_name, category_id, brand_id } = req.query;
  const { limit, offset } = getPagination(page, size);
  const { seller_id } = req.seller;

  // console.log("filter", filter);

  try {
    let productMaster = await ProductMasterBofModel.findAndCountAll({
      order: [["id", "DESC"]],
      where: {
        ...(category_id && { category_id: category_id }),
        ...(brand_id && { brand_id: brand_id }),
        ...(p_name && {
          [Op.or]: [
            { name_en: { [Op.like]: `%${p_name}%` } },
            { name_th: { [Op.like]: `%${p_name}%` } },
            { name_ch: { [Op.like]: `%${p_name}%` } },
          ],
        }),
      },
      limit,
      offset,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
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
      ],
    });

    const products = await ProductModel.findAll({
      where: {
        seller_id: seller_id,
      },
      attributes: ["product_id"],
    });
    // .then((data) => {
    const response = getPagingData(productMaster, page, limit);

    // response.result = response.result.map((our) => {
    //   if (our.image) {
    //     our.dataValues.image = `${PRODUCT_MEDIA_URL}/${our.image}`;
    //   } else {
    //     our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    //   }
    //   return our;
    // });
    response.result = response.result
      .filter((our) => !products.some((p) => p.product_id === our.id))
      .map((our) => {
        our.dataValues.image = our.image
          ? `${PRODUCT_MEDIA_URL}/${our.image}`
          : `${BASE_MEDIA_URL}/600x400.svg`;
        return our;
      });
    // response.result = response.result.map((our) => {
    //   // check productMaster existing in product
    //   const exists = products.some((p) => p.product_id === our.id);
    //   if (exists) {
    //     our.dataValues.product_exist = exists;
    //   } else {
    //     our.dataValues.product_exist = exists;
    //   }
    //   return our;
    // });

    res.json(response);

    // .catch((err) => {
    //   res
    //     .status(HTTP_BAD_REQUEST)
    //     .json({ status: HTTP_BAD_REQUEST, msg: err.message });
    // });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.findCountAllProduct = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    const totalAllProduct = await ProductModel.count({
      where: {
        product_status: "active",
        seller_id,
      },
    });

    res.status(HTTP_SUCCESS).json({ totalAllProduct });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
