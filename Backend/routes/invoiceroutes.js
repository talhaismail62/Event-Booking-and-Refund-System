const express = require('express');
const router = express.Router();

const { generateInvoice, getInvoice, getAllInvoices } = require('../controllers/invoicecontroller');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, authorizeRoles('admin', 'staff'), getAllInvoices);
router.post('/:bookingId/generate', verifyToken, authorizeRoles('admin', 'staff'), generateInvoice);
router.get('/:bookingId', verifyToken, getInvoice);

module.exports = router;