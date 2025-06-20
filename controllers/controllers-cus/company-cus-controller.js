const CompanyAccountModel = require("../../models/models-bof/company-account-model");
const { HTTP_NOT_FOUND, HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

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
    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: company });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
