const Joi = require("joi");

exports.customerCreateSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  wallet_address: Joi.string().required(),
});

exports.customerLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
