const AddressCusModel = require("../../models/models-cus/address-cus-model");
const CustomerCusModel = require("../../models/models-cus/customer-cus-model");
const {
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
} = require("../../utils/http_status");

exports.findAllAddressByCustomer = async (req, res) => {
  const { cus_id } = req.customer;
  try {
    const addressCus = await AddressCusModel.findAll({
      where: { customer_id: cus_id },
      include: [
        {
          model: CustomerCusModel,
          as: "customer",
        },
      ],
    });
    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: addressCus });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.findAllAddressByCustomerId = async (req, res) => {
  const { id } = req.params;
  const { cus_id } = req.customer;
  try {
    const addressCus = await AddressCusModel.findOne({
      where: { id, customer_id: cus_id },
    });
    if (!addressCus) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Address not found or does not belong to this customer.",
      });
    }
    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: addressCus });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.createAddressByCustomer = async (req, res) => {
  const { cus_id } = req.customer;
  const addressData = {
    ...req.body,
    customer_id: cus_id,
  };

  try {
    const newAddress = await AddressCusModel.create(addressData);
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: newAddress,
    });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};

exports.updateAddressByCustomer = async (req, res) => {
  const { id } = req.params;
  const { cus_id } = req.customer;

  try {
    const address = await AddressCusModel.findOne({
      where: { id, customer_id: cus_id },
    });

    if (!address) {
      return res.status(HTTP_BAD_REQUEST).json({
        status: HTTP_BAD_REQUEST,
        msg: "Address not found or does not belong to this customer.",
      });
    }

    const updatedAddress = await AddressCusModel.update(req.body, {
      where: { id, customer_id: cus_id },
    });
    res.status(HTTP_SUCCESS).json({
      status: HTTP_SUCCESS,
      data: updatedAddress,
    });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
