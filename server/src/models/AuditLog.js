const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    role: String,
    action: String, // e.g., "Run Payroll"
    description: String,
    ip: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
