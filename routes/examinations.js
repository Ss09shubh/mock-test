const express = require('express');
const { 
  createExamination, 
  getExamination, 
  startExamination, 
  submitExamination 
} = require('../controllers/examinations');
const { protect, authorize } = require('../middleware/auth');
const { createExaminationValidation, submitExaminationValidation, startExaminationValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new examination (admin only)
router.post('/', authorize('admin'), createExaminationValidation, createExamination);

// Get examination details by ID
router.get('/:id', getExamination);

// Start an examination (member only)
router.post('/:id/start', authorize('member'), startExaminationValidation, startExamination);

// Submit examination answers (member only)
router.post('/:id/submit', authorize('member'), submitExaminationValidation, submitExamination);

module.exports = router;