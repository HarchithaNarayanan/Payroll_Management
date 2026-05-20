const mongoose = require('mongoose');

const payrollProfileSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    salaryStructureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalaryStructure',
        required: true
    },
    earnings: [{
        component: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryComponent' },
        name: String,
        amount: Number
    }],
    deductions: [{
        component: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryComponent' },
        name: String,
        amount: Number
    }],
    grossSalary: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        default: 0
    },
    bankDetails: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        paymentMode: { type: String, default: 'Bank Transfer' }
    },
    taxRegime: {
        type: String,
        enum: ['Old', 'New'],
        default: 'New'
    },
    PAN: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PayrollProfile', payrollProfileSchema);
