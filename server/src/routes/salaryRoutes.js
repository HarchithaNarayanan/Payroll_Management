const express = require('express');
const router = express.Router();
const { createComponent, getComponents, createStructure, getStructures, getStructureById } = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/components')
    .post(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), createComponent)
    .get(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), getComponents);

router.route('/structures')
    .post(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), createStructure)
    .get(protect, authorize('Super Admin', 'Payroll Admin', 'HR Admin'), getStructures);

router.route('/structures/:id')
    .get(protect, getStructureById);

module.exports = router;
