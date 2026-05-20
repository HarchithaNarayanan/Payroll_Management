// Module 8: Tax Management System
const TaxDeclaration = require('../models/TaxDeclaration');
const Employee = require('../models/Employee');
const { logAction, notifyUser } = require('../utils/logger');

// @desc    Submit Tax Declaration
// @route   POST /api/tax/declaration
// @access  Private (Employee)
const submitDeclaration = async (req, res) => {
    const { financialYear, section80C, section80D, hra, employeeId } = req.body;

    try {
        let employee;

        // If employeeId is provided and user is Super Admin, find that employee
        if (employeeId && req.user.role === 'Super Admin') {
            employee = await Employee.findOne({ employeeId });
        } else {
            // Otherwise, find employee by logged-in user
            employee = await Employee.findOne({ user: req.user._id });
        }

        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        let declaration = await TaxDeclaration.findOne({
            employee: employee._id,
            financialYear
        });

        if (declaration) {
            declaration.section80C = section80C;
            declaration.section80D = section80D;
            declaration.hra = hra;
            declaration.status = 'Pending';
        } else {
            declaration = new TaxDeclaration({
                organization: req.user.organization || employee.organization,
                employee: employee._id,
                financialYear,
                section80C,
                section80D,
                hra
            });
        }

        await declaration.save();

        // Log action
        await logAction({
            userId: req.user._id,
            role: req.user.role,
            action: 'Submitted Tax Declaration',
            description: `Submitted tax declaration for FY ${financialYear}`,
            ip: req.ip
        });

        res.status(200).json(declaration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Declaration (Self)
// @route   GET /api/tax/declaration
// @access  Private
const getMyDeclaration = async (req, res) => {
    const { financialYear, employeeId } = req.query;
    try {
        let employee;
        if (employeeId && (req.user.role === 'HR Admin' || req.user.role === 'Super Admin' || req.user.role === 'Payroll Admin')) {
            employee = await Employee.findOne({ employeeId });
        } else {
            employee = await Employee.findOne({ user: req.user._id });
        }

        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        const declaration = await TaxDeclaration.findOne({
            employee: employee._id,
            financialYear
        }).populate('employee', 'employeeId');

        res.json(declaration || { employeeId: employee.employeeId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get All Declarations (HR Admin)
// @route   GET /api/tax/all
// @access  Private (HR Admin)
const getAllDeclarations = async (req, res) => {
    try {
        const declarations = await TaxDeclaration.find({ organization: req.user.organization })
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name email' }
            });
        res.json(declarations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve/Reject Declaration
// @route   PUT /api/tax/approve/:id
// @access  Private (HR Admin)
const approveDeclaration = async (req, res) => {
    const { status } = req.body;
    try {
        const declaration = await TaxDeclaration.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name' }
            });

        if (declaration) {
            // Log action
            await logAction({
                userId: req.user._id,
                role: req.user.role,
                action: `${status} Tax Declaration`,
                description: `${status} tax declaration for FY ${declaration.financialYear} of ${declaration.employee.user.name}`,
                ip: req.ip
            });

            // Notify employee
            await notifyUser({
                userId: declaration.employee.user._id,
                message: `Your tax declaration for FY ${declaration.financialYear} has been ${status.toLowerCase()}.`,
                type: status === 'Approved' ? 'success' : 'warning'
            });
        }

        res.json(declaration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { submitDeclaration, getMyDeclaration, getAllDeclarations, approveDeclaration };
