const express = require('express');
const router = express.Router();
const { getMyPayslips, getMySalaryStructure, getMyTaxDetails } = require('../controllers/essController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/payslips', protect, authorize('Employee'), getMyPayslips);
router.get('/salary-structure', protect, authorize('Employee'), getMySalaryStructure);
router.get('/tax-details', protect, authorize('Employee'), getMyTaxDetails);

module.exports = router;
