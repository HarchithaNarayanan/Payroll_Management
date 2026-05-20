const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixPayrollProfileIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payroll_db');
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('payrollprofiles');

        // Show current indexes
        console.log('\n📋 Current indexes on payrollprofiles:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => {
            console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop all problematic legacy indexes
        const legacyIndexes = ['employeeId_1', 'employeeCode_1'];

        for (const indexName of legacyIndexes) {
            console.log(`\n🔧 Attempting to drop ${indexName} index...`);
            try {
                await collection.dropIndex(indexName);
                console.log(`✓ Successfully dropped ${indexName} index`);
            } catch (error) {
                if (error.codeName === 'IndexNotFound') {
                    console.log(`ℹ️  Index ${indexName} not found (already dropped)`);
                } else {
                    throw error;
                }
            }
        }

        // Show final indexes
        console.log('\n📋 Final indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(idx => {
            console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n✅ Done! All legacy indexes removed.');
        console.log('   You can now save payroll profiles without issues.\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixPayrollProfileIndexes();
