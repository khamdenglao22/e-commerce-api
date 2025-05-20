const ProductGalleryBofModel = require("../../models/models-bof/product-gallery-bof-model");
const {
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_SUCCESS,
} = require("../../utils/http_status");
const path = require("path");
const { PRODUCT_MEDIA_URL, BASE_MEDIA_URL } = require("../../utils/constant");
const fs = require("fs");

exports.createProductGallery = async (req, res) => {
  try {
    let result;

    if (!req.files) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "ກະລຸນາເລືອກຮູບ",
      });
    }

    if (req.files && req.files.image.length >= 0) {
      for (let i = 0; i < req.files.image.length; i++) {
        console.log("req.files[i] = ", req.files.image[i]);
        let image = req.files.image[i];
        let allowFiles = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowFiles.includes(image.mimetype)) {
          return res.status(400).json({
            status: 400,
            msg: "ຮູບຫ້ອງຄ້າຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
          });
        }
        const ext = path.extname(image.name);
        const filename = Date.now() + ext;
        image.mv(
          path.join(__dirname, `../../uploads/images/products/${filename}`)
        );
        req.body.image = filename;
        await ProductGalleryBofModel.create(req.body);
      }
    } else {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowFiles.includes(image.mimetype)) {
        return res.status(400).json({
          status: 400,
          msg: "ຮູບຫ້ອງຄ້າຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(
        path.join(__dirname, `../../uploads/images/products/${filename}`)
      );
      req.body.image = filename;
      await ProductGalleryBofModel.create(req.body);
    }
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      msg: "create product gallery successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.getProductGallery = async (req, res) => {
  try {
    const { p_id } = req.params;
    let result = await ProductGalleryBofModel.findAll({
      where: { product_id: p_id },
    });
    if (!result) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "ບໍ່ສາມາດສະແດງຮູບ",
      });
    }
    result = result.map((row) => {
      if (row.image) {
        row.dataValues.image = `${PRODUCT_MEDIA_URL}/${row.image}`;
      } else {
        row.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return row;
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

exports.deleteProductGallery = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await ProductGalleryBofModel.findByPk(id);
    if (!result) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Product not found",
      });
    }
    if (result.image) {
      // Delete image file if it exists
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/images/products/${result.image}`
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    await ProductGalleryBofModel.destroy({
      where: { id: id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      msg: "Product deleted successfully",
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
