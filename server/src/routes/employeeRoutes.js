const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, getMyProfile } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), createEmployee)
    .get(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin', 'Finance'), getEmployees);

router.get('/me', protect, getMyProfile);

router.route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), updateEmployee);

module.exports = router;
