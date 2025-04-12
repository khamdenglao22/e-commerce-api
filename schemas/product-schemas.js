const Joi = require('joi');

exports.productSchema = Joi.object({
  name_en: Joi.string().required(),
  name_th: Joi.string().required(),
  name_ch: Joi.string().required(),
  description_en: Joi.string().required(),
  description_th: Joi.string().required(),
  description_ch: Joi.string().required(),
  price: Joi.number().required(),
  category_id: Joi.number().required(),
  brand_id: Joi.number().required(),
});