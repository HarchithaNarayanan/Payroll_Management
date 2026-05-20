const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Attendance = require('./src/models/Attendance');

dotenv.config();

const normalize = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');
        console.log('Connected to DB');

        const records = await Attendance.find();
        console.log(`Processing ${records.length} records...`);

        for (const record of records) {
            const originalDate = new Date(record.date);
            const normalizedDate = new Date(originalDate);
            normalizedDate.setHours(0, 0, 0, 0);

            if (originalDate.getTime() !== normalizedDate.getTime()) {
                // Check if a record with normalized date already exists
                const existing = await Attendance.findOne({
                    _id: { $ne: record._id },
                    employee: record.employee,
                    date: normalizedDate
                });

                if (existing) {
                    console.log(`Merge record ${record._id} into ${existing._id} for date ${normalizedDate.toISOString()}`);
                    // Merge OT and other fields if needed, or just delete the old one
                    existing.overtimeHours = (existing.overtimeHours || 0) + (record.overtimeHours || 0);
                    // Keep the "best" status? Usually seeder records have 'Present'.
                    if (record.status !== 'Present') existing.status = record.status;
                    await existing.save();
                    await Attendance.deleteOne({ _id: record._id });
                } else {
                    record.date = normalizedDate;
                    await record.save();
                }
            }
        }

        console.log('Normalization complete.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

normalize();
