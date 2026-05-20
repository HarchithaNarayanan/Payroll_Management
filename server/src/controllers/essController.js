const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const SalaryStructure = require('../models/SalaryStructure');
const TaxDeclaration = require('../models/TaxDeclaration');

// @desc    Get Employee Payslips
// @route   GET /api/employee/payslips
// @access  Private (Employee only)
const getMyPayslips = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const payslips = await Payroll.find({ employee: employee._id })
            .sort({ year: -1, month: -1 });

        res.json(payslips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Employee Salary Structure
// @route   GET /api/employee/salary-structure
// @access  Private (Employee only)
const getMySalaryStructure = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id }).populate('salaryStructure');
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        res.json(employee.salaryStructure);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Employee Tax Details
// @route   GET /api/employee/tax-details
// @access  Private (Employee only)
const getMyTaxDetails = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const declaration = await TaxDeclaration.findOne({
            employee: employee._id,
            financialYear: '2024-2025' // Default or dynamic
        });

        res.json({
            taxRegime: employee.taxRegime,
            declaration
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMyPayslips,
    getMySalaryStructure,
    getMyTaxDetails
};
