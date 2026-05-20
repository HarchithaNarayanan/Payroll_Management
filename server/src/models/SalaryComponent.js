const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    name: {
        type: String,
        required: true, // e.g., Basic, HRA, Medical Allowance
    },
    type: {
        type: String,
        enum: ['Earning', 'Deduction'],
        required: true,
    },
    calculationType: {
        type: String,
        enum: ['Flat Amount', 'Percentage of Basic', 'Formula'],
        default: 'Flat Amount',
    },
    value: {
        type: Number, // Default value or percentage
        default: 0
    },
    isTaxable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SalaryComponent', salaryComponentSchema);
