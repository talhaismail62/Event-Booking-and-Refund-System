const express = require('express');
const router = express.Router();

const { 
    getAllServices, createService, updateService,
    getAllFoodItems, createFoodItem, updateFoodItem
} = require('../controllers/menucontroller');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/services', getAllServices);
router.post('/services', verifyToken, authorizeRoles('admin'), createService);
router.patch('/services/:id', verifyToken, authorizeRoles('admin'), updateService);
router.get('/food', getAllFoodItems);
router.post('/food', verifyToken, authorizeRoles('admin'), createFoodItem);
router.patch('/food/:id', verifyToken, authorizeRoles('admin'), updateFoodItem);

module.exports = router;