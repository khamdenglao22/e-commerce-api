const DepositSellerModel = require("../../models/models-seller/deposit-seller-model");
const { DEPOSIT_MEDIA_URL } = require("../../utils/constant");
const { HTTP_SUCCESS, HTTP_BAD_REQUEST } = require("../../utils/http_status");

exports.findAllDeposit = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    let deposit = await DepositSellerModel.findAll({
      where: {
        seller_id,
      },
    });

    deposit = deposit.map((row) => {
      if (row.image) {
        row.dataValues.image = `${DEPOSIT_MEDIA_URL}/${row.image}`;
      } else {
        our.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
      }
      return row;
    });

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: deposit });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.findDepositById = async (req, res) => {
  const { id } = req.params;
  const { seller_id } = req.seller;
  try {
    let deposit = await DepositSellerModel.findOne({
      where: {
        id,
        seller_id,
      },
    });
    if (!deposit) {
      return res.status(HTTP_NOT_FOUND).json({
        status: HTTP_NOT_FOUND,
        msg: "Deposit not found",
      });
    }

    if (deposit.image) {
      deposit.dataValues.image = `${DEPOSIT_MEDIA_URL}/${deposit.image}`;
    } else {
      deposit.dataValues.image = `${BASE_MEDIA_URL}/600x400.svg`;
    }

    res.status(HTTP_SUCCESS).json({ status: HTTP_SUCCESS, data: deposit });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};

exports.createDeposit = async (req, res) => {
  const { seller_id } = req.seller;
  try {
    if (!req.files) {
      delete req.body.image;
    }

    // Upload image
    if (req.files && req.files.image) {
      let image = req.files.image;
      let allowFiles = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowFiles.includes(image.mimetype)) {
        return next({
          status: 400,
          msg: "ຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
        });
      }
      const ext = path.extname(image.name);
      const filename = Date.now() + ext;
      image.mv(
        path.join(__dirname, `../../uploads/images/deposit/${filename}`)
      );
      req.body.image = filename;
    }
    req.body.seller_id = seller_id;
    const deposit = await DepositSellerModel.create(req.body);
    res.status(HTTP_CREATED).json({
      status: HTTP_CREATED,
      data: deposit,
    });
  } catch (error) {
    res.status(HTTP_BAD_REQUEST).json({
      status: HTTP_BAD_REQUEST,
      msg: error.message,
    });
  }
};
