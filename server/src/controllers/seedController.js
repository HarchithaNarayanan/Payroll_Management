const User = require('../models/User');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');

const seedData = async (req, res) => {
    try {
        await User.deleteMany();
        await Organization.deleteMany();
        await Employee.deleteMany();

        const org = await Organization.create({
            name: 'Acme Corp',
            email: 'admin@acme.com',
            phone: '1234567890',
            address: '123 Tech Park',
            website: 'https://acme.com'
        });

        // Use plain text, model pre-save handles hashing
        const password = 'password@123#';

        const users = [
            { name: 'Super Admin', email: 'superadmin@payroll.com', role: 'Super Admin' },
            { name: 'Payroll Admin', email: 'payroll@payroll.com', role: 'Payroll Admin' },
            { name: 'HR Admin', email: 'hr@payroll.com', role: 'HR Admin' },
            { name: 'Employee', email: 'employee@payroll.com', role: 'Employee' },
            { name: 'Finance User', email: 'finance@payroll.com', role: 'Finance' }
        ];

        const createdUsers = [];

        for (const u of users) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: password,
                organization: org._id,
                role: u.role
            });
            createdUsers.push(user);
        }

        for (const user of createdUsers) {
            await Employee.create({
                user: user._id,
                organization: org._id,
                employeeId: `EMP-${user.role.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                designation: user.role,
                department: 'Management',
                dateOfJoining: new Date(),
                status: 'Active',
                taxRegime: 'New',
                paymentDetails: {
                    bankName: 'HDFC Bank',
                    accountNumber: '501000' + Math.floor(1000000 + Math.random() * 9000000),
                    ifscCode: 'HDFC0001234'
                }
            });
        }

        res.json({ message: 'Data Seeded Successfully', users: createdUsers.map(u => ({ email: u.email, role: u.role })) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Seeding failed', error: error.message });
    }
};

module.exports = { seedData };
