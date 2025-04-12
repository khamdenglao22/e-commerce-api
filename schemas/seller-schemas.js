const Joi = require("joi");

exports.sellerSchema = Joi.object({
  store_name: Joi.string().required(),
  email: Joi.string().email().required(),
  front_document: Joi.string().required(),
  back_certificate: Joi.string().required(),
  contact_person: Joi.string().required(),
  contact_number: Joi.string().required(),
  address: Joi.string().required(),
  invitation_code: Joi.string().required(),
  seller_status: Joi.number().integer().default(1),
});
