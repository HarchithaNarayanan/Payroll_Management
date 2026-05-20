const express = require('express');
const router = express.Router();
const { runPayroll, getPayroll, approvePayroll, unlockPayroll } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/run')
    .post(protect, authorize('Payroll Admin', 'Super Admin'), runPayroll);

router.route('/approve')
    .put(protect, authorize('Payroll Admin', 'Super Admin'), approvePayroll);

router.route('/unlock')
    .put(protect, authorize('Super Admin'), unlockPayroll);

const { disbursePayroll } = require('../controllers/payrollController');
router.put('/disburse', protect, authorize('Payroll Admin', 'Finance', 'Super Admin'), disbursePayroll);

router.route('/')
    .get(protect, authorize('HR Admin', 'Super Admin', 'Finance', 'Payroll Admin'), getPayroll);

const { generateBankFile } = require('../controllers/bankController');
router.get('/bank-transfer', protect, authorize('Payroll Admin', 'Finance'), generateBankFile);

const { getPayslip, getEmployeePayslips } = require('../controllers/payslipController');
router.route('/payslip/:id').get(protect, getPayslip);
router.route('/employee/:userId').get(protect, getEmployeePayslips);

module.exports = router;
