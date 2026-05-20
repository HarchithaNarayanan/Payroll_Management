const express = require('express');
const router = express.Router();
const {
    getPFReport,
    getESIReport,
    getPayrollSummary,
    getCTCAnalysis,
    getDepartmentReport,
    getAuditLogs,
    exportReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('Super Admin', 'Payroll Admin', 'Finance'), getPayrollSummary);
router.get('/ctc', protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), getCTCAnalysis);
router.get('/department', protect, authorize('Super Admin', 'Payroll Admin', 'Finance', 'HR Admin'), getDepartmentReport);
router.get('/pf', protect, authorize('Super Admin', 'Payroll Admin', 'Finance'), getPFReport);
router.get('/esi', protect, authorize('Super Admin', 'Payroll Admin', 'Finance'), getESIReport);
router.get('/audit-logs', protect, authorize('Super Admin'), getAuditLogs);
router.get('/export', protect, authorize('Super Admin', 'Payroll Admin', 'Finance'), exportReport);

module.exports = router;
