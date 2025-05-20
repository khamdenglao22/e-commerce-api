const Joi = require("joi");

exports.sellerSchema = Joi.object({
  store_name: Joi.string().required(),
  email: Joi.string().email().required(),
  contact_person: Joi.string().required(),
  contact_number: Joi.string().required(),
  address: Joi.string().required(),
  invitation_code: Joi.string().empty(""),
  customer_id: Joi.number().required(),
});
