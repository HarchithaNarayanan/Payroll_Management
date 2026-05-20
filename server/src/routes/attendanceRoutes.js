const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendance,
    closeAttendance,
    reopenAttendance,
    getClosureStatus
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Super Admin', 'HR Admin', 'Payroll Admin', 'Employee'), markAttendance)
    .get(protect, authorize('Super Admin', 'HR Admin', 'Payroll Admin', 'Employee'), getAttendance);

router.get('/closure-status', protect, authorize('Super Admin', 'HR Admin', 'Payroll Admin', 'Employee'), getClosureStatus);
router.post('/close', protect, authorize('HR Admin', 'Super Admin'), closeAttendance);
router.post('/reopen', protect, authorize('HR Admin', 'Super Admin'), reopenAttendance);

module.exports = router;
