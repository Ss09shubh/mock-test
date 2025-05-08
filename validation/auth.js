const Joi = require('joi');

exports.registerValidation = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please include a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': 'Gender must be male, female, or other',
    'string.empty': 'Gender is required',
    'any.required': 'Gender is required'
  }),
  phone: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).required().messages({
    'string.pattern.base': 'Please enter a valid phone number',
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  password2: Joi.string().equal(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required'
  }).optional(),
  role: Joi.string().valid('admin', 'member').required().messages({
    'any.only': 'Role must be either admin or member',
    'string.empty': 'Role is required',
    'any.required': 'Role is required'
  })
});

exports.loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please include a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});