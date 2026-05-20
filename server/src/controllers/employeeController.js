const Employee = require('../models/Employee');
const User = require('../models/User');
const { logAction } = require('../utils/logger');

// @desc    Create a new employee (and optionally a User account)
// @route   POST /api/employees
// @access  Private (HR/Admin)
const createEmployee = async (req, res) => {
    const {
        name, email, password, role, // For User creation
        employeeId, designation, department, dateOfJoining,
        personalDetails, paymentDetails, taxRegime, salaryStructure
    } = req.body;

    try {
        // 1. Create User
        // Check if user exists first? Assuming clean create flow here.
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Role Permission: Only Super Admin can assign roles other than 'Employee'
        let userRole = 'Employee';
        if (req.user.role === 'Super Admin' && req.body.role) {
            userRole = req.body.role;
        }

        user = await User.create({
            name,
            email,
            password: password || 'Welcome@123', // Default or generated password
            role: userRole,
            organization: req.user.organization
        });

        // 2. Create Employee Profile
        const employee = await Employee.create({
            user: user._id,
            organization: req.user.organization,
            employeeId,
            designation,
            department,
            dateOfJoining,
            personalDetails,
            paymentDetails,
            taxRegime,
            salaryStructure
        });

        // Log action
        await logAction({
            userId: req.user._id,
            role: req.user.role,
            action: 'Created Employee',
            description: `Created employee profile for ${name} (${employeeId})`,
            ip: req.ip
        });

        res.status(201).json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all employees for the org
// @route   GET /api/employees
// @access  Private (HR/Admin)
const getEmployees = async (req, res) => {
    const employees = await Employee.find({ organization: req.user.organization })
        .populate('user', 'name email role');
    res.json(employees);
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
    const employee = await Employee.findById(req.params.id)
        .populate('user', 'name email role');

    if (employee && employee.organization.toString() === req.user.organization.toString()) {
        const profile = await require('../models/PayrollProfile').findOne({ employee: employee._id });
        res.json({ ...employee.toObject(), payrollProfile: profile });
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR/Admin)
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (employee && employee.organization.toString() === req.user.organization.toString()) {
            const { name, designation, department, status, personalDetails, paymentDetails, taxRegime, salaryStructure } = req.body;

            // Update associated User name if provided
            if (name) {
                await User.findByIdAndUpdate(employee.user, { name });
            }

            employee.designation = designation || employee.designation;
            employee.department = department || employee.department;
            employee.status = status || employee.status;
            employee.personalDetails = personalDetails || employee.personalDetails;
            employee.paymentDetails = paymentDetails || employee.paymentDetails;
            employee.taxRegime = taxRegime || employee.taxRegime;
            employee.salaryStructure = salaryStructure || employee.salaryStructure;

            await employee.save();

            const updatedEmployee = await Employee.findById(employee._id).populate('user', 'name email role');
            // Log action
            await logAction({
                userId: req.user._id,
                role: req.user.role,
                action: 'Updated Employee',
                description: `Updated employee profile for ${updatedEmployee.user.name} (${updatedEmployee.employeeId})`,
                ip: req.ip
            });

            res.json(updatedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current employee profile
// @route   GET /api/employees/me
// @access  Private (Employee)
const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id })
            .populate('user', 'name email role')
            .populate('salaryStructure', 'name');

        if (!employee) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const PayrollProfile = require('../models/PayrollProfile');
        const payrollProfile = await PayrollProfile.findOne({ employee: employee._id });

        res.json({
            ...employee.toObject(),
            // Merge or nesting? Let's provide it as a nested object for clarity
            payrollProfile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createEmployee, getEmployees, getEmployeeById, updateEmployee, getMyProfile };
