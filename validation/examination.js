const Joi = require('joi');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

// Option schema
const optionSchema = Joi.object({
  text: Joi.string().required().messages({
    'string.empty': 'Option text is required',
    'any.required': 'Option text is required'
  }),
  isCorrect: Joi.boolean().required().messages({
    'any.required': 'Option correctness is required'
  })
});

// Question schema
const questionSchema = Joi.object({
  text: Joi.string().required().messages({
    'string.empty': 'Question text is required',
    'any.required': 'Question text is required'
  }),
  marks: Joi.number().required().min(1).messages({
    'number.base': 'Marks must be a number',
    'number.min': 'Marks must be at least 1',
    'any.required': 'Question marks is required'
  }),
  options: Joi.array().items(optionSchema).min(2).required().messages({
    'array.min': 'Question must have at least 2 options',
    'array.base': 'Options must be an array',
    'any.required': 'Question options are required'
  })
});

// Answer schema
const answerSchema = Joi.object({
  questionId: objectId.required().messages({
    'any.required': 'Question ID is required',
    'any.invalid': 'Invalid Question ID format'
  }),
  optionId: objectId.required().messages({
    'any.required': 'Option ID is required',
    'any.invalid': 'Invalid Option ID format'
  })
});

exports.createExaminationValidation = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Examination name is required',
    'any.required': 'Examination name is required'
  }),
  courseId: objectId.required().messages({
    'string.empty': 'Course ID is required',
    'any.required': 'Course ID is required',
    'any.invalid': 'Invalid Course ID format'
  }),
  totalMarks: Joi.number().required().min(1).messages({
    'number.base': 'Total marks must be a number',
    'number.min': 'Total marks must be at least 1',
    'any.required': 'Total marks is required'
  }),
  passMarks: Joi.number().required().min(1).messages({
    'number.base': 'Pass marks must be a number',
    'number.min': 'Pass marks must be at least 1',
    'any.required': 'Pass marks is required'
  }),
  durationMinutes: Joi.number().required().min(1).messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 minute',
    'any.required': 'Duration in minutes is required'
  }),
  questions: Joi.array().items(questionSchema).min(1).required().messages({
    'array.min': 'Examination must have at least 1 question',
    'array.base': 'Questions must be an array',
    'any.required': 'Questions are required'
  })
}).custom((value, helpers) => {
  // Validate that pass marks is not greater than total marks
  if (value.passMarks > value.totalMarks) {
    return helpers.error('custom.passMarks', {
      message: 'Pass marks cannot be greater than total marks'
    });
  }
  
  // Validate that sum of question marks equals total marks
  if (value.questions) {
    const sumOfMarks = value.questions.reduce((sum, q) => sum + q.marks, 0);
    if (sumOfMarks !== value.totalMarks) {
      return helpers.error('custom.questionMarks', {
        message: 'Sum of question marks does not match total marks'
      });
    }
  }
  
  return value;
});

exports.submitExaminationValidation = Joi.object({
  examResultId: objectId.required().messages({
    'string.empty': 'Exam result ID is required',
    'any.required': 'Exam result ID is required',
    'any.invalid': 'Invalid Exam result ID format'
  }),
  answers: Joi.object().pattern(
    objectId,
    objectId
  ).required().messages({
    'object.base': 'Answers must be an object',
    'any.required': 'Answers are required'
  })
});