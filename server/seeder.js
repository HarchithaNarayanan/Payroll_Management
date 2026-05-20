const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Organization = require('./src/models/Organization');
const Employee = require('./src/models/Employee');
const Statutory = require('./src/models/Statutory');
const Attendance = require('./src/models/Attendance');
const SalaryComponent = require('./src/models/SalaryComponent');
const SalaryStructure = require('./src/models/SalaryStructure');
const TaxDeclaration = require('./src/models/TaxDeclaration');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany(),
            Organization.deleteMany(),
            Employee.deleteMany(),
            Statutory.deleteMany(),
            Attendance.deleteMany(),
            SalaryComponent.deleteMany(),
            SalaryStructure.deleteMany(),
            TaxDeclaration.deleteMany(),
            require('./src/models/Payroll').deleteMany(),
            require('./src/models/AuditLog').deleteMany()
        ]);

        // Drop legacy indices if they exist to prevent seeder failures
        try {
            const employeeCollection = mongoose.connection.collection('employees');
            await employeeCollection.dropIndex('email_1');
            console.log('Dropped legacy email index on employees');
        } catch (e) {
            // Index might not exist, ignore
        }

        console.log('Creating Organization...');
        const org = await Organization.create({
            name: 'Acme Global Corp',
            email: 'admin@acme-global.com',
            phone: '9876543210',
            address: 'Tech Hub, Silicon Valley',
            website: 'https://acme-global.com'
        });

        console.log('Creating Statutory Configurations...');
        await Statutory.create({
            organization: org._id,
            pf: { enabled: true, employerContribution: 12, employeeContribution: 12, wageLimit: 15000 },
            esi: { enabled: true, employerContribution: 3.25, employeeContribution: 0.75, wageLimit: 21000 },
            professionalTax: {
                enabled: true,
                slabs: [
                    { minSalary: 0, maxSalary: 15000, taxAmount: 0 },
                    { minSalary: 15001, maxSalary: 20000, taxAmount: 150 },
                    { minSalary: 20001, maxSalary: 999999, taxAmount: 200 }
                ]
            }
        });

        const password = 'password@123#';

        const userData = [
            { name: 'Super Admin', email: 'superadmin@payroll.com', role: 'Super Admin' },
            { name: 'Payroll Admin', email: 'payroll@payroll.com', role: 'Payroll Admin' },
            { name: 'HR Manager', email: 'hr@payroll.com', role: 'HR Admin' },
            { name: 'Finance Lead', email: 'finance@payroll.com', role: 'Finance' },
            { name: 'Alice Smith', email: 'alice@payroll.com', role: 'Employee' },
            { name: 'Employee User', email: 'employee@payroll.com', role: 'Employee' },
            { name: 'Bob Johnson', email: 'bob@payroll.com', role: 'Employee' },
            { name: 'Charlie Dave', email: 'charlie@payroll.com', role: 'Employee' }
        ];

        console.log('Creating Salary Components...');
        // Common Components
        const basic = await SalaryComponent.create({ organization: org._id, name: 'Basic Pay', type: 'Earning', calculationType: 'Flat Amount', value: 0 }); // Value overridden in structure
        const hra = await SalaryComponent.create({ organization: org._id, name: 'HRA', type: 'Earning', calculationType: 'Percentage of Basic', value: 0 });
        const medical = await SalaryComponent.create({ organization: org._id, name: 'Medical Allowance', type: 'Earning', calculationType: 'Flat Amount', value: 0 });
        const special = await SalaryComponent.create({ organization: org._id, name: 'Special Allowance', type: 'Earning', calculationType: 'Flat Amount', value: 0 });

        // Deductions
        const pf = await SalaryComponent.create({ organization: org._id, name: 'Provident Fund', type: 'Deduction', calculationType: 'Percentage of Basic', value: 12 });
        const tax = await SalaryComponent.create({ organization: org._id, name: 'Income Tax', type: 'Deduction', calculationType: 'Flat Amount', value: 0 });

        console.log('Creating Salary Structures...');

        // 1. Executive Structure
        const executiveStructure = await SalaryStructure.create({
            organization: org._id,
            name: 'Executive Structure',
            description: 'For Top Management and Admins',
            components: [
                { component: basic._id, calculationType: 'Flat Amount', value: 80000 },
                { component: hra._id, calculationType: 'Percentage of Basic', value: 50 },
                { component: medical._id, calculationType: 'Flat Amount', value: 5000 },
                { component: special._id, calculationType: 'Flat Amount', value: 25000 },
                { component: pf._id, calculationType: 'Percentage of Basic', value: 12 },
                { component: tax._id, calculationType: 'Flat Amount', value: 5000 }
            ]
        });

        // 2. Manager Structure
        const managerStructure = await SalaryStructure.create({
            organization: org._id,
            name: 'Manager Structure',
            description: 'For HR and Finance Leads',
            components: [
                { component: basic._id, calculationType: 'Flat Amount', value: 50000 },
                { component: hra._id, calculationType: 'Percentage of Basic', value: 50 },
                { component: medical._id, calculationType: 'Flat Amount', value: 3000 },
                { component: pf._id, calculationType: 'Percentage of Basic', value: 12 }
            ]
        });

        // 3. Staff Structure
        const staffStructure = await SalaryStructure.create({
            organization: org._id,
            name: 'Staff Structure',
            description: 'For Standard Employees',
            components: [
                { component: basic._id, calculationType: 'Flat Amount', value: 25000 },
                { component: hra._id, calculationType: 'Percentage of Basic', value: 40 },
                { component: medical._id, calculationType: 'Flat Amount', value: 2000 },
                { component: pf._id, calculationType: 'Percentage of Basic', value: 12 }
            ]
        });

        console.log('Creating Users and Employee Profiles...');
        const createdUsers = [];
        for (const u of userData) {
            const user = await User.create({
                ...u,
                password,
                organization: org._id
            });
            createdUsers.push(user);
        }

        const employees = [];
        const departments = ['Engineering', 'HR', 'Finance', 'Sales', 'Operations'];

        for (const user of createdUsers) {
            let assignedStructure;
            if (user.role === 'Super Admin' || user.role === 'Payroll Admin') {
                assignedStructure = executiveStructure._id;
            } else if (user.role === 'HR Admin' || user.role === 'Finance') {
                assignedStructure = managerStructure._id;
            } else {
                assignedStructure = staffStructure._id;
            }

            const emp = await Employee.create({
                user: user._id,
                organization: org._id,
                employeeId: `EMP-${user.role.replace(' ', '').toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`,
                designation: user.role === 'Employee' ? 'Sr. Associate' : user.role,
                department: departments[Math.floor(Math.random() * departments.length)],
                dateOfJoining: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                status: 'Active',
                salaryStructure: assignedStructure,
                taxRegime: Math.random() > 0.5 ? 'New' : 'Old',
                paymentDetails: {
                    bankName: 'Global Bank',
                    accountNumber: '123456789' + Math.floor(100 + Math.random() * 899),
                    ifscCode: 'GLOB0001234',
                    panNumber: 'ABCDE' + Math.floor(1000 + Math.random() * 8999) + 'F'
                }
            });
            employees.push(emp);
        }

        console.log('Creating Attendance Records (Last 30 Days)...');
        const today = new Date();
        for (const emp of employees) {
            for (let i = 1; i <= 30; i++) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                // Skip weekends roughly
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                await Attendance.create({
                    employee: emp._id,
                    organization: org._id,
                    date,
                    status: Math.random() > 0.1 ? 'Present' : 'Leave',
                    checkIn: new Date(date.setHours(9, Math.floor(Math.random() * 30), 0)),
                    checkOut: new Date(date.setHours(18, Math.floor(Math.random() * 30), 0))
                });
            }
        }

        console.log('Creating Tax Declarations...');
        for (const emp of employees.filter(e => e.designation === 'Sr. Associate')) {
            await TaxDeclaration.create({
                employee: emp._id,
                organization: org._id,
                financialYear: '2024-2025',
                section80C: [{ description: 'LIC Premium', amount: 25000 }, { description: 'PPF', amount: 50000 }],
                section80D: { amount: 15000 },
                hra: { rentAmount: 120000, landlordPan: 'ABCDE1234F' },
                status: 'Approved'
            });
        }

        console.log('All modules seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
