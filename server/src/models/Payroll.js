const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    month: {
        type: Number,
        required: true, // 1-12
    },
    year: {
        type: Number,
        required: true,
    },
    workingDays: Number,
    presentDays: Number,
    lopDays: Number,
    overtimeHours: {
        type: Number,
        default: 0
    },

    earnings: [{
        name: String, // Basic, HRA
        amount: Number
    }],
    deductions: [{
        name: String, // PF, Tax
        amount: Number
    }],

    grossSalary: Number,
    overtimePay: {
        type: Number,
        default: 0
    },
    totalDeductions: Number,
    netSalary: Number,

    status: {
        type: String,
        enum: ['Draft', 'Processing', 'Approved', 'Paid'],
        default: 'Draft',
    },
    paymentDate: Date,
    transactionId: String
}, {
    timestamps: true,
});

// Unique run per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
