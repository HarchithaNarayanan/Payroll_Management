const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    name: {
        type: String,
        required: true, // e.g., Grade A structure
    },
    description: String,
    components: [{
        component: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SalaryComponent'
        },
        calculationType: { // Overrideable
            type: String,
            enum: ['Flat Amount', 'Percentage of Basic', 'Formula'],
        },
        value: Number, // Override value
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
