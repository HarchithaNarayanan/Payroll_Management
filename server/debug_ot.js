const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');
const Employee = require('./src/models/Employee');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');

        console.log('--- Checking Attendance with OT ---');
        const otRecords = await Attendance.find({ overtimeHours: { $gt: 0 } }).populate('employee', 'employeeId');
        console.log(`Found ${otRecords.length} records with OT.`);
        otRecords.forEach(r => {
            console.log(`Date: ${r.date.toISOString().split('T')[0]}, Emp: ${r.employee?.employeeId}, OT: ${r.overtimeHours}`);
        });

        console.log('\n--- Checking Payroll Records ---');
        // Check for current month (Feb 2026)
        const payrolls = await Payroll.find({ month: 2, year: 2026 }).populate('employee', 'employeeId');
        console.log(`Found ${payrolls.length} payroll records for Feb 2026.`);
        payrolls.forEach(p => {
            console.log(`Emp: ${p.employee?.employeeId}, OT Hours: ${p.overtimeHours}, OT Pay: ${p.overtimePay}, Net: ${p.netSalary}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debug();
