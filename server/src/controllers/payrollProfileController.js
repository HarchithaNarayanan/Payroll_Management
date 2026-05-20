const PayrollProfile = require('../models/PayrollProfile');
const Employee = require('../models/Employee');
const SalaryStructure = require('../models/SalaryStructure');

// @desc    Create payroll profile
// @route   POST /api/payroll-profile
// @access  Private (HR Admin)
const createPayrollProfile = async (req, res) => {
    try {
        const { employeeId, salaryStructureId, bankDetails, taxRegime, PAN, earnings, deductions, grossSalary, netSalary } = req.body;

        // Validate organization
        if (!req.user.organization) {
            return res.status(400).json({ message: 'User organization not found. Please contact administrator.' });
        }

        // Check for duplicate
        const existing = await PayrollProfile.findOne({ employee: employeeId });
        if (existing) {
            return res.status(400).json({ message: 'Payroll profile already exists for this employee' });
        }

        const profile = await PayrollProfile.create({
            employee: employeeId,
            organization: req.user.organization,
            salaryStructureId,
            bankDetails,
            taxRegime,
            PAN,
            earnings,
            deductions,
            grossSalary,
            netSalary,
            createdBy: req.user._id
        });

        // Link salary structure to employee for quick lookup
        await Employee.findByIdAndUpdate(employeeId, { salaryStructure: salaryStructureId });

        res.status(201).json(profile);
    } catch (error) {
        console.error(error);
        const fs = require('fs');
        fs.appendFileSync('server_error.log', `${new Date().toISOString()} - ${error.stack}\n`);
        res.status(500).json({ message: error.message, error: error.toString() });
    }
};

// @desc    Get payroll profile by employee ID
// @route   GET /api/payroll-profile/:employeeId
// @access  Private (HR Admin, Payroll Admin)
const getPayrollProfile = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (!employeeId || employeeId === 'undefined') {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const profile = await PayrollProfile.findOne({ employee: employeeId })
            .populate('employee')
            .populate('salaryStructureId');

        if (!profile) {
            return res.json(null);
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update payroll profile
// @route   PUT /api/payroll-profile/:employeeId
// @access  Private (HR Admin)
const updatePayrollProfile = async (req, res) => {
    try {
        const profile = await PayrollProfile.findOne({ employee: req.params.employeeId });

        if (!profile) {
            return res.status(404).json({ message: 'Payroll profile not found' });
        }

        const { salaryStructureId, bankDetails, taxRegime, PAN, earnings, deductions, grossSalary, netSalary } = req.body;

        profile.salaryStructureId = salaryStructureId || profile.salaryStructureId;
        profile.bankDetails = bankDetails || profile.bankDetails;
        profile.taxRegime = taxRegime || profile.taxRegime;
        profile.PAN = PAN || profile.PAN;
        profile.earnings = earnings || profile.earnings;
        profile.deductions = deductions || profile.deductions;
        profile.grossSalary = grossSalary || profile.grossSalary;
        profile.netSalary = netSalary || profile.netSalary;
        profile.updatedBy = req.user._id;

        await profile.save();

        // Update employee reference too
        if (salaryStructureId) {
            await Employee.findByIdAndUpdate(req.params.employeeId, { salaryStructure: salaryStructureId });
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get employees without payroll profile
// @route   GET /api/payroll-profile/without-profile
// @access  Private (HR Admin)
const getEmployeesWithoutProfile = async (req, res) => {
    try {
        const profiles = await PayrollProfile.find({ organization: req.user.organization }).select('employee');
        const employeeWithProfileIds = profiles.map(p => p.employee);

        const employees = await Employee.find({
            organization: req.user.organization,
            _id: { $nin: employeeWithProfileIds }
        }).populate('user', 'name email');

        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createPayrollProfile,
    getPayrollProfile,
    updatePayrollProfile,
    getEmployeesWithoutProfile
};
