const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authcontroller'); 
const { getProfile, updateProfile } = require('../controllers/usercontroller');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);

module.exports = router;