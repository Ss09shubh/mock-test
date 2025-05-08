const express = require('express');
const { createCourse, getCourses, getCourse, assignCourse } = require('../controllers/courses');
const { getCourseExaminations } = require('../controllers/examinations');
const { protect, authorize } = require('../middleware/auth');
const { createCourseValidation, assignCourseValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 */
router.post('/', authorize('admin'), createCourseValidation, createCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses (Admin sees all, Member sees assigned)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *       401:
 *         description: Not authorized
 */
router.get('/', getCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get single course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this course
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourse);

/**
 * @swagger
 * /api/courses/{id}/assign:
 *   post:
 *     summary: Assign course to member (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course assigned successfully
 *       400:
 *         description: Invalid input or course already assigned
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 *       404:
 *         description: Course or member not found
 */
router.post('/:id/assign', authorize('admin'), assignCourseValidation, assignCourse);

/**
 * @swagger
 * /api/courses/{courseId}/examinations:
 *   get:
 *     summary: Get all examinations for a course
 *     tags: [Courses, Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of examinations
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this course
 *       404:
 *         description: Course not found
 */
router.get('/:courseId/examinations', getCourseExaminations);

module.exports = router;