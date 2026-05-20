const express = require('express');
const router = express.Router();
const {
    createPayrollProfile,
    getPayrollProfile,
    updatePayrollProfile,
    getEmployeesWithoutProfile
} = require('../controllers/payrollProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/without-profile', protect, authorize('HR Admin', 'Super Admin'), getEmployeesWithoutProfile);

router.route('/')
    .post(protect, authorize('HR Admin', 'Super Admin'), createPayrollProfile);

router.route('/:employeeId')
    .get(protect, authorize('HR Admin', 'Payroll Admin', 'Super Admin'), getPayrollProfile)
    .put(protect, authorize('HR Admin', 'Super Admin'), updatePayrollProfile);

module.exports = router;
