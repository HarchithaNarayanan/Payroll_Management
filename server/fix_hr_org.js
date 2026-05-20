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

const fixHRManagerOrganization = async () => {
    await connectDB();

    try {
        const User = require('./src/models/User');
        const Organization = require('./src/models/Organization');

        // Find the organization
        const org = await Organization.findOne();
        if (!org) {
            console.log('No organization found! Please run seeder first.');
            process.exit(1);
        }

        console.log(`Found organization: ${org.name} (${org._id})`);

        // Find HR Manager user
        const hrUser = await User.findOne({ email: 'hr@payroll.com' });
        if (!hrUser) {
            console.log('HR Manager user not found!');
            process.exit(1);
        }

        console.log(`Found HR Manager: ${hrUser.name}`);
        console.log(`Current organization: ${hrUser.organization}`);

        // Update if missing
        if (!hrUser.organization) {
            hrUser.organization = org._id;
            await hrUser.save();
            console.log(`✓ Updated HR Manager organization to: ${org._id}`);
        } else {
            console.log('✓ HR Manager already has organization assigned');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixHRManagerOrganization();
