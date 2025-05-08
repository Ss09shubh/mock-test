const Joi = require('joi');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

exports.createCourseValidation = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Course name is required',
    'any.required': 'Course name is required'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  })
});

exports.assignCourseValidation = Joi.object({
  memberId: objectId.required().messages({
    'string.empty': 'Member ID is required',
    'any.required': 'Member ID is required',
    'any.invalid': 'Invalid Member ID format'
  })
});