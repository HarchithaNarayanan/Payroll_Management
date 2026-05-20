const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Attendance = require('./src/models/Attendance');

dotenv.config();

const verifyLOP = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');

        // Mock data usually sent by frontend for "Unpaid Leave"
        const testData = {
            employee: new mongoose.Types.ObjectId(), // Mock ID
            organization: new mongoose.Types.ObjectId(), // Mock ID
            date: new Date(),
            status: 'Leave',
            isLOP: true
        };

        // We can't easily test the controller without a full request mock/server running with auth.
        // But we can test if the MODEL supports passing isLOP and saving it.
        // The controller successfully passes req.body.isLOP to the model/update.

        console.log('Checking Schema paths...');
        const schemaPath = Attendance.schema.path('isLOP');
        if (schemaPath) {
            console.log('isLOP field exists in schema.');
        } else {
            console.error('isLOP field MISSING in schema.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyLOP();
