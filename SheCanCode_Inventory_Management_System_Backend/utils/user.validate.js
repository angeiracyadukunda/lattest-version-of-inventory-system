const Joi = require("joi");

const signUpSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email(),
  password: Joi.string()
    .required()
    .min(5)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    role: Joi.string(),
});

module.exports = signUpSchema;
