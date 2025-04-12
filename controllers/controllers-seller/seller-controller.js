const SellerModel = require("../../models/models-seller/seller-model");
const { sellerSchema } = require("../../schemas/seller-schemas");
const { HTTP_CREATED, HTTP_BAD_REQUEST } = require("../../utils/http_status");


exports.createSeller = async (req, res) => {
  try {
    const { cus_id } = req.customer;
    req.body.customer_id = cus_id;
    const { error } = sellerSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: error.message,
      });
    }
    await SellerModel.create(req.body);
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
