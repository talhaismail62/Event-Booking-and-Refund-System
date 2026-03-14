const express = require('express');
const router = express.Router();
const { getAllHalls } = require('../controllers/hallcontroller');

router.get('/', getAllHalls);

module.exports = router;