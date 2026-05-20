const AuditLog = require('../models/AuditLog');

// @desc    Get All Audit Logs
// @route   GET /api/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res) => {
    try {
        const { startDate, endDate, role, action } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (role) query.role = role;
        if (action) query.action = { $regex: action, $options: 'i' };

        const logs = await AuditLog.find(query)
            .populate('user', 'name role')
            .sort({ createdAt: -1 });

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAuditLogs };
