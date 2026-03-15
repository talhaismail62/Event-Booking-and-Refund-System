const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authcontroller');
const { verifyToken, authorizeRoles } = require('../middleware/authmiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken, (req, res) => {
    res.status(200).json({ 
        message: 'You are logged in.', 
        user: req.user 
    });
});

router.get('/adminonly', verifyToken, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({ 
        message: 'Welcome to admin area.' 
    });
});

module.exports = router;