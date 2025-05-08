const Joi = require('joi');

exports.createMemberValidation = Joi.object({
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
  })
});

exports.updateMemberValidation = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Name is required'
  }),
  email: Joi.string().email().messages({
    'string.email': 'Please include a valid email'
  }),
  gender: Joi.string().valid('male', 'female', 'other').messages({
    'any.only': 'Gender must be male, female, or other'
  }),
  phone: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/).messages({
    'string.pattern.base': 'Please enter a valid phone number'
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters'
  })
});