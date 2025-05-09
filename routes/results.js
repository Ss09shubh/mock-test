const express = require('express');
const { 
  getResults, 
  getResult, 
  getMemberResults, 
  getCourseResults 
} = require('../controllers/results');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all results (admin: all results, member: own results only)
router.get('/', getResults);

// Get a specific result by ID
router.get('/:id', getResult);

// Get all results for a specific member (admin only)
router.get('/member/:memberId', authorize('admin'), getMemberResults);

// Get all results for a specific course (admin only)
router.get('/course/:courseId', authorize('admin'), getCourseResults);

module.exports = router;