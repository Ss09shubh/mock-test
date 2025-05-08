const express = require('express');
const { 
  createExamination, 
  getExamination, 
  startExamination, 
  submitExamination 
} = require('../controllers/examinations');
const { protect, authorize } = require('../middleware/auth');
const { createExaminationValidation, submitExaminationValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/examinations:
 *   post:
 *     summary: Create a new examination (Admin only)
 *     tags: [Examinations]
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
 *               - courseId
 *               - totalMarks
 *               - passMarks
 *               - durationMinutes
 *               - questions
 *             properties:
 *               name:
 *                 type: string
 *               courseId:
 *                 type: string
 *               totalMarks:
 *                 type: number
 *               passMarks:
 *                 type: number
 *               durationMinutes:
 *                 type: number
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     marks:
 *                       type: number
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *     responses:
 *       201:
 *         description: Examination created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 *       404:
 *         description: Course not found
 */
router.post('/', authorize('admin'), createExaminationValidation, createExamination);

/**
 * @swagger
 * /api/examinations/{id}:
 *   get:
 *     summary: Get single examination
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Examination ID
 *     responses:
 *       200:
 *         description: Examination data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this examination
 *       404:
 *         description: Examination not found
 */
router.get('/:id', getExamination);

/**
 * @swagger
 * /api/examinations/{id}/start:
 *   post:
 *     summary: Start an examination (Member only)
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Examination ID
 *     responses:
 *       200:
 *         description: Examination started successfully
 *       400:
 *         description: Examination already in progress
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to take this examination
 *       404:
 *         description: Examination not found
 */
router.post('/:id/start', authorize('member'), startExamination);

/**
 * @swagger
 * /api/examinations/{id}/submit:
 *   post:
 *     summary: Submit examination answers (Member only)
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Examination ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examResultId
 *               - answers
 *             properties:
 *               examResultId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     optionId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Examination submitted successfully
 *       400:
 *         description: Invalid input or examination not in progress
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to submit this examination
 *       404:
 *         description: Examination or exam result not found
 */
router.post('/:id/submit', authorize('member'), submitExaminationValidation, submitExamination);

module.exports = router;