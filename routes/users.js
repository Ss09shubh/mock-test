const express = require('express');
const { createMember, getMembers, getMember } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');
const { createMemberValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new member (Admin only)
 *     tags: [Users]
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
 *               - email
 *               - gender
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Invalid input or member already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 */
router.post('/', authorize('admin'), createMemberValidation, createMember);

/**
 * @swagger
 * /api/users/members:
 *   get:
 *     summary: Get all members (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all members
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 */
router.get('/members', authorize('admin'), getMembers);

/**
 * @swagger
 * /api/users/members/{id}:
 *   get:
 *     summary: Get single member (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to access this route
 *       404:
 *         description: Member not found
 */
router.get('/members/:id', authorize('admin'), getMember);

module.exports = router;