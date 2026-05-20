// Module 8: Tax Management System
const express = require('express');
const router = express.Router();
const {
    submitDeclaration,
    getMyDeclaration,
    getAllDeclarations,
    approveDeclaration
} = require('../controllers/taxController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/declaration')
    .post(protect, authorize('Employee', 'Super Admin'), submitDeclaration)
    .get(protect, authorize('Super Admin', 'Payroll Admin', 'Employee'), getMyDeclaration);

router.route('/all')
    .get(protect, authorize('Super Admin', 'Payroll Admin'), getAllDeclarations);

router.route('/approve/:id')
    .put(protect, authorize('Super Admin'), approveDeclaration);

module.exports = router;
