const mongoose = require('mongoose');

const attendanceClosureSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    isClosed: {
        type: Boolean,
        default: true,
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

// Ensure unique closure record per date per organization
attendanceClosureSchema.index({ organization: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceClosure', attendanceClosureSchema);
