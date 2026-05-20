const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'],
        default: 'Present',
    },
    checkIn: Date,
    checkOut: Date,
    workHours: Number,
    overtimeHours: {
        type: Number,
        default: 0
    },
    isLOP: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

// Ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
