const express = require('express');
const router = express.Router();

const { getAllHalls, createHall, updateHall } = require('../controllers/hallController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllHalls);
router.post('/', verifyToken, authorizeRoles('admin'), createHall);
router.patch('/:id', verifyToken, authorizeRoles('admin'), updateHall);

module.exports = router;