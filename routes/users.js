const express = require('express');
const { createMember, getMembers, getMember } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');
const { createMemberValidation } = require('../validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', authorize('admin'), createMemberValidation, createMember);

router.get('/members', authorize('admin'), getMembers);

router.get('/members/:id', authorize('admin'), getMember);

module.exports = router;