const express = require('express');
const router = express.Router();
const { getAllRefunds, processRefund } = require('../controllers/refundcontroller');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, authorizeRoles('admin','staff'), getAllRefunds);
router.patch('/:id/process', verifyToken, authorizeRoles('admin'), processRefund);

module.exports = router;