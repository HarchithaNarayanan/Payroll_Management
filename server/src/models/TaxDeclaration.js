// Module 8: Tax Management System
const mongoose = require('mongoose');

const taxDeclarationSchema = new mongoose.Schema({
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
    financialYear: {
        type: String, // e.g., "2024-2025"
        required: true
    },
    section80C: [{
        description: String, // LIC, PPF
        amount: Number,
        proofUrl: String
    }],
    section80D: { // Medical
        amount: Number,
        proofUrl: String
    },
    hra: {
        rentAmount: Number,
        landlordPan: String,
        proofUrl: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    comments: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('TaxDeclaration', taxDeclarationSchema);
