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

/**
 * @swagger
 * /api/results:
 *   get:
 *     summary: Get all exam results (Admin sees all, Member sees own)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exam results
 *       401:
 *         description: Not authorized
 */
router.get('/', getResults);

/**
 * @swagger
 * /api/results/{id}:
 *   get:
 *     summary: Get single exam result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Exam result data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this result
 *       404:
 *         description: Result not found
 */
router.get('/:id', getResult);

/**
 * @swagger
 * /api/results/member/{memberId}:
 *   get:
 *     summary: Get results for a specific member (Admin only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: string
 *         required: true
 *         description: Member ID
 *     responses:
 *       200:
 *         description: List of member's exam results
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 */
router.get('/member/:memberId', authorize('admin'), getMemberResults);

/**
 * @swagger
 * /api/results/course/{courseId}:
 *   get:
 *     summary: Get results for a specific course (Admin only)
 *     tags: [Results]
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
 *         description: List of course exam results
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 */
router.get('/course/:courseId', authorize('admin'), getCourseResults);

module.exports = router;