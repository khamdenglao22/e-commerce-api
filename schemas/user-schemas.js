const Joi = require("joi");

exports.userCreateSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  role_id: Joi.number().required(),
});

exports.userUpdateSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().required(),
  role_id: Joi.number().required(),
});

exports.userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

exports.userChangePasswordSchema = Joi.object({
  password: Joi.string().required(),
});
