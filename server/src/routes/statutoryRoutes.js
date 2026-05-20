const express = require('express');
const router = express.Router();
const { getStatutoryConfig, updateStatutoryConfig } = require('../controllers/statutoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Super Admin', 'Payroll Admin'), getStatutoryConfig)
    .put(protect, authorize('Super Admin'), updateStatutoryConfig);

module.exports = router;
