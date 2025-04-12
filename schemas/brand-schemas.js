const Joi = require("joi");

exports.brandSchema = Joi.object({
  name_en: Joi.string().required(),
  name_th: Joi.string().required(),
  name_ch: Joi.string().required(),
  image: Joi.string().allow(null),
});
