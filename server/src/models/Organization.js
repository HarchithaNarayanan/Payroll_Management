const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    registrationNumber: {
        type: String,
    },
    pan: {
        type: String,
    },
    tan: {
        type: String,
    },
    gst: {
        type: String,
    },
    // Default PF/ESI configurations can go here or in a separate config schema
    pfRules: {
        employerContribution: { type: Number, default: 12 },
        employeeContribution: { type: Number, default: 12 },
        isEnabled: { type: Boolean, default: true }
    },
    esiRules: {
        employerContribution: { type: Number, default: 3.25 },
        employeeContribution: { type: Number, default: 0.75 },
        isEnabled: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Organization', organizationSchema);
