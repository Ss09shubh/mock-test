const express = require('express');
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../validation');

const router = express.Router();

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login); 

router.get('/me', protect, getMe);

module.exports = router;