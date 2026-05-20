const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const dropLegacyIndex = async () => {
    await connectDB();

    try {
        const db = mongoose.connection.db;
        const collection = db.collection('payrollprofiles');

        // List current indexes
        console.log('Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop the problematic employeeId_1 index
        try {
            await collection.dropIndex('employeeId_1');
            console.log('\n✓ Successfully dropped employeeId_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('\n✓ Index employeeId_1 does not exist (already dropped or never existed)');
            } else {
                throw error;
            }
        }

        // Show remaining indexes
        console.log('\nRemaining indexes:');
        const remainingIndexes = await collection.indexes();
        remainingIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n✓ Done! You can now save payroll profiles.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropLegacyIndex();
