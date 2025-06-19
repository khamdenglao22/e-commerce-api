const { Op } = require("sequelize");
const ProductMasterBofModel = require("../../models/models-bof/product-master-bof-model");
const CartCusModel = require("../../models/models-cus/cart-cus-model");
const ProductModel = require("../../models/models-seller/product-model");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const {
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} = require("../../utils/http_status");
const ProductSizeOptionModel = require("../../models/models-bof/product-size-option-model");
const ProductColorOptionModel = require("../../models/models-bof/product-color-option-model");

exports.findCartByCustomer = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    let cart = await CartCusModel.findAll({
      where: { customer_id: cus_id },
      attributes: { exclude: ["product_id", "customer_id"] },
      include: [
        {
          model: ProductModel,
          as: "product",
          attributes: { exclude: ["product_id"] },
          include: [
            {
              model: ProductMasterBofModel,
              as: "product_master",
              attributes: [
                "id",
                "name_en",
                "name_th",
                "name_ch",
                "price",
                "image",
              ],
            },
          ],
        },
        {
          model: ProductSizeOptionModel,
          as: "productSize",
        },
        {
          model: ProductColorOptionModel,
          as: "productColor",
        },
      ],
    });
    if (!cart) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart not found",
      });
    }

    // console.log(cart);

    cart = cart.map((gallery) => {
      if (gallery.product.product_master.image) {
        gallery.product.product_master.dataValues.image = `${PRODUCT_MEDIA_URL}/${gallery.product.product_master.image}`;
      } else {
        gallery.product.product_master.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return gallery;
    });

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.qty * item.product.product_master.price,
      0
    );
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: cart,
      totalQty,
      totalPrice,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    const { product_id, qty, product_size_id, product_color_id, cart_price } =
      req.body;
    if (!cus_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Customer ID not found",
      });
    }
    const checkProduct = await ProductModel.findOne({
      where: {
        id: product_id,
      },
    });
    if (!checkProduct) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Product not found",
      });
    }
    if (!qty) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Quantity not found",
      });
    }

    let existingCart;
    if (!product_size_id && !product_color_id) {
      existingCart = await CartCusModel.findOne({
        where: {
          [Op.and]: [
            {
              product_id: product_id,
            },
            {
              customer_id: cus_id,
            },
          ],
        },
      });
    }

    if (product_size_id && !product_color_id) {
      existingCart = await CartCusModel.findOne({
        where: {
          [Op.and]: [
            {
              product_id: product_id,
            },
            {
              customer_id: cus_id,
            },
            {
              product_size_id: product_size_id,
            },
          ],
        },
      });
    }

    if (!product_size_id && product_color_id) {
      existingCart = await CartCusModel.findOne({
        where: {
          [Op.and]: [
            {
              product_id: product_id,
            },
            {
              customer_id: cus_id,
            },
            {
              product_color_id: product_color_id,
            },
          ],
        },
      });
    }

    if (product_size_id && product_color_id) {
      existingCart = await CartCusModel.findOne({
        where: {
          [Op.and]: [
            {
              product_id: product_id,
            },
            {
              customer_id: cus_id,
            },
            {
              product_size_id: product_size_id,
            },
            {
              product_color_id: product_color_id,
            },
          ],
        },
      });
    }

    if (existingCart) {
      await CartCusModel.update(
        { qty: existingCart.qty + qty },
        { where: { id: existingCart.id } }
      );
    } else {
      await CartCusModel.create({
        customer_id: cus_id,
        product_id,
        qty,
        cart_price,
        product_size_id,
        product_color_id,
      });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product added to cart successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.updateAddToCart = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    const { id } = req.params;

    const cartItem = await CartCusModel.findOne({
      where: { id: id, customer_id: cus_id },
    });
    if (!cartItem) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart item not found",
      });
    }
    await CartCusModel.update(
      { qty: cartItem.qty + 1 },
      { where: { id: cartItem.id } }
    );
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Cart updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.updateRemoveCart = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    const { id } = req.params;

    const cartItem = await CartCusModel.findOne({
      where: { id: id, customer_id: cus_id },
    });
    if (!cartItem) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart item not found",
      });
    }
    if (cartItem.qty >= 1) {
      await CartCusModel.update(
        { qty: cartItem.qty - 1 },
        { where: { id: cartItem.id } }
      );
    } else {
      await CartCusModel.destroy({ where: { id: cartItem.id } });
    }
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Cart updated successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    const { id } = req.params;

    const cartItem = await CartCusModel.findOne({
      where: { id: id, customer_id: cus_id },
    });
    if (!cartItem) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Cart item not found",
      });
    }
    await CartCusModel.destroy({ where: { id: cartItem.id } });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Cart item deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
