const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Explicitly require models in specific order
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Organization = require('./src/models/Organization');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');
const SalaryStructure = require('./src/models/SalaryStructure');
const SalaryComponent = require('./src/models/SalaryComponent');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');
        console.log('Connected to DB');

        console.log('\n--- Checking ALL Attendance with OT ---');
        const allOt = await Attendance.find({ overtimeHours: { $gt: 0 } }).populate('employee');
        console.log(`Found ${allOt.length} records with OT.`);
        allOt.forEach(r => {
            console.log(`Date: ${r.date.toISOString()}, Emp: ${r.employee?.employeeId}, OT: ${r.overtimeHours}`);
        });

        console.log('\n--- Checking Payroll for Feb 2026 ---');
        const payrolls = await Payroll.find({ month: 2, year: 2026 }).populate('employee');
        console.log(`Found ${payrolls.length} payroll records.`);
        payrolls.forEach(p => {
            console.log(`Emp: ${p.employee?.employeeId}, OT Hours: ${p.overtimeHours}, OT Pay: ${p.overtimePay}, Gross: ${p.grossSalary}`);
        });

        if (allOt.length > 0) {
            const empId = allOt[0].employee._id;
            console.log(`\n--- Deep Dive for Emp ${allOt[0].employee.employeeId} ---`);
            const startDate = new Date(2026, 1, 1);
            const endDate = new Date(2026, 2, 0);
            const records = await Attendance.find({
                employee: empId,
                date: { $gte: startDate, $lte: endDate }
            });
            const sum = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
            console.log(`Manual Sum for Feb: ${sum}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug Error:', error);
        process.exit(1);
    }
};

debug();
