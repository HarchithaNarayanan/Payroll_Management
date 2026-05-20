const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Super Admin', 'Payroll Admin'), getAuditLogs);

module.exports = router;
