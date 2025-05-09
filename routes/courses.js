const express = require('express');
const { createCourse, getCourses, getCourse, assignCourse } = require('../controllers/courses');
const { getCourseExaminations } = require('../controllers/examinations');
const { protect, authorize } = require('../middleware/auth');
const { createCourseValidation, assignCourseValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new course (admin only)
router.post('/', authorize('admin'), createCourseValidation, createCourse);

// Get all accessible courses
router.get('/', getCourses);

// Get course details by ID
router.get('/:id', getCourse);

// Assign a course to a member (admin only)
router.post('/:id/assign', authorize('admin'), assignCourseValidation, assignCourse);

// Get all examinations for a course
router.get('/:courseId/examinations', getCourseExaminations);

module.exports = router;