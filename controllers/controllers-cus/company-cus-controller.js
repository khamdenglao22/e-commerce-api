const CompanyAccountModel = require("../../models/models-bof/company-account-model");
const {
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
  HTTP_BAD_REQUEST,
} = require("../../utils/http_status");
const { BASE_MEDIA_URL, BRAND_MEDIA_URL } = require("../../utils/constant");
const CompanyModel = require("../../models/models-bof/company-model");

exports.findCompanyByCurrency = async (req, res) => {
  const { code_currency } = req.query;
  try {
    let company = await CompanyAccountModel.findOne({
      where: {
        type: code_currency,
      },
    });
    if (!company) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Company not found",
      });
    }

    if (company.image) {
      company.dataValues.image = `${BRAND_MEDIA_URL}/${company.image}`;
    } else {
      company.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: company });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    await CompanyModel.findAll()
      .then((response) => {
        res.status(HTTP_SUCCESS).json({
          status: HTTP_SUCCESS,
          data: response,
        });
      })
      .catch((err) => {
        res
          .status(HTTP_BAD_REQUEST)
          .json({ status: HTTP_BAD_REQUEST, msg: err.message });
      });
  } catch (error) {
    res
      .status(HTTP_BAD_REQUEST)
      .json({ status: HTTP_BAD_REQUEST, msg: error.message });
  }
};
