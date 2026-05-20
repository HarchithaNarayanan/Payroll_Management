const mongoose = require('mongoose');

const statutorySchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        unique: true
    },
    pf: {
        enabled: { type: Boolean, default: true },
        employerContribution: { type: Number, default: 12 }, // Percentage
        employeeContribution: { type: Number, default: 12 }, // Percentage
        wageLimit: { type: Number, default: 15000 },
        adminCharges: { type: Number, default: 0.5 },
        edliCharges: { type: Number, default: 0.5 }
    },
    esi: {
        enabled: { type: Boolean, default: true },
        employerContribution: { type: Number, default: 3.25 }, // Percentage
        employeeContribution: { type: Number, default: 0.75 }, // Percentage
        wageLimit: { type: Number, default: 21000 }
    },
    professionalTax: {
        enabled: { type: Boolean, default: false },
        slabs: [{
            minSalary: Number,
            maxSalary: Number,
            taxAmount: Number
        }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Statutory', statutorySchema);
