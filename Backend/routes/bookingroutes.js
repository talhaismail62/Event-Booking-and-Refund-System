const express = require('express');
const router = express.Router();

const { createBooking, getMyBookings, getAllBookings, payForBooking, cancelBooking } = require('../controllers/bookingscontroller');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.get('/all', verifyToken, authorizeRoles('admin','staff'), getAllBookings);
router.post('/:id/pay', verifyToken, payForBooking);
router.post('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;