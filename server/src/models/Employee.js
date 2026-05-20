const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Link to auth user
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    employeeId: {
        type: String,
        required: true,
        unique: true, // Custom ID like EMP001
    },
    designation: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Resigned', 'Terminated'],
        default: 'Active',
    },
    personalDetails: {
        dob: Date,
        gender: String,
        address: String,
        phone: String,
    },
    paymentDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        panNumber: String, // Critical for Tax
        uanNumber: String, // PF
        esiNumber: String
    },
    taxRegime: {
        type: String,
        enum: ['Old', 'New'],
        default: 'New'
    },
    // Salary Structure assignment will be linked here later or in a separate collection
    salaryStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalaryStructure'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
