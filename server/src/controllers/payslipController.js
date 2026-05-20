const Payroll = require('../models/Payroll');

const Employee = require('../models/Employee');

// @desc    Get Single Payslip
// @route   GET /api/payroll/payslip/:id
// @access  Private (Employee owns it or Admin)
const getPayslip = async (req, res) => {
    console.log('Fetching Payslip for ID:', req.params.id);
    const payroll = await Payroll.findById(req.params.id)
        .populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' } // Ensure this nesting is here
        })
        .populate('organization');

    if (payroll && payroll.employee) {
        console.log('Populated Employee User:', payroll.employee.user);
    } else {
        console.log('Payroll or Employee not found');
    }

    if (!payroll) {
        return res.status(404).json({ message: 'Payslip not found' });
    }

    // Role check
    if (req.user.role === 'Employee' && payroll.employee.user._id.toString() !== req.user._id.toString()) {
        // Note: if user is populated, it's an object, so ._id is needed. If string, just compare.
        // Let's handle both for safety during debug
        const ownerId = payroll.employee.user._id || payroll.employee.user;
        if (ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
    }

    res.json(payroll);
};

// @desc    Get All Payslips for Logged in Employee
// @route   GET /api/payroll/employee/:userId
// @access  Private
const getEmployeePayslips = async (req, res) => {
    try {
        // 1. Find Employee by User ID
        const employee = await Employee.findOne({ user: req.params.userId });

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // 2. Find Payrolls by Employee ID
        const payrolls = await Payroll.find({ employee: employee._id })
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ year: -1, month: -1 });

        res.json(payrolls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPayslip, getEmployeePayslips };
