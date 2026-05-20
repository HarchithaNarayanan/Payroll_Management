const express = require('express');
const router = express.Router();
const { seedData } = require('../controllers/seedController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Super Admin'), seedData);

module.exports = router;
