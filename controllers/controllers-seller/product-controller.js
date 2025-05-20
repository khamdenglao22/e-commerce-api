const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const ProductModel = require("../../models/models-seller/product-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_SUCCESS,
} = require("../../utils/http_status");

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
  const { page, size } = req.query;
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
